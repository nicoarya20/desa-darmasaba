// Penyapu sesi suara: menutup (dan hangup) sesi starting|active yang basi, lewat batas durasi, atau saat
// suara dimatikan / kuota global habis — juga bila tab pengunjung sudah hilang tanpa heartbeat/close.
// Scheduler in-app tiap 15 detik, hanya di production; satu sweep tidak pernah tumpang tindih.
import { isJennaRetentionSchedulerEnabled, unref, type Timers } from "../chat/retention";
import { VOICE_SWEEP_INTERVAL_MS } from "./voice.constants";
import { closeAndHangup, usageToday, voiceUnavailable, type VoiceDeps } from "./voice.context";
import { closeAt, elapsedSeconds, isStaleSession, remainingSeconds } from "./voice.quota";

/** Jumlah sesi yang ditutup. */
export async function sweepVoiceSessions(deps: VoiceDeps): Promise<number> {
  const open = await deps.repo.findOpenSessions({});
  if (open.length === 0) return 0;

  const rt = await deps.loadRuntime();
  const now = deps.now();
  const unavailable = voiceUnavailable(rt) !== null;
  // Tanpa identitas: sisa = sisa global (kuota per pengunjung minimal 1 menit, tidak membatasi di sini).
  const globalExhausted = !unavailable && remainingSeconds(rt.settings, await usageToday(deps.repo, now, undefined, open)) <= 0;

  let closed = 0;
  for (const row of open) {
    const reason =
      elapsedSeconds(row, now) >= row.maxSeconds
        ? "max_duration"
        : unavailable
          ? "disabled"
          : globalExhausted
            ? "quota"
            : isStaleSession(row, now)
              ? "stale"
              : null;
    // closeAt menagih sesi basi sampai heartbeat terakhir apa pun alasannya.
    if (reason && (await closeAndHangup(deps, rt, row, closeAt(row, now, reason)))) closed += 1;
  }
  return closed;
}

type SweeperOptions = {
  run?: () => Promise<unknown>;
  env?: Record<string, string | undefined>;
  timers?: Pick<Timers, "setInterval">;
  /** Penanda global agar hot reload / register() ganda tidak memasang timer dobel. */
  store?: { __jennaVoiceSweeper?: boolean };
};

/** Pasang timer penyapu (sekali per proses). Mengembalikan true bila timer baru dipasang. */
export function startJennaVoiceSweeper({
  run = async () => {
    const { defaultVoiceDeps } = await import("./voice.deps");
    return sweepVoiceSessions(defaultVoiceDeps());
  },
  env = process.env,
  timers = { setInterval },
  store = globalThis as { __jennaVoiceSweeper?: boolean },
}: SweeperOptions = {}): boolean {
  if (!isJennaRetentionSchedulerEnabled(env) || store.__jennaVoiceSweeper) return false;
  store.__jennaVoiceSweeper = true;

  let running = false;
  const tick = () => {
    if (running) return; // Sweep sebelumnya belum selesai (DB/gateway lambat): lewati satu putaran.
    running = true;
    run()
      .catch((error: unknown) => {
        console.error("[jenna-voice] Sweep gagal; dicoba lagi pada putaran berikutnya:", error);
      })
      .finally(() => {
        running = false;
      });
  };
  unref(timers.setInterval(tick, VOICE_SWEEP_INTERVAL_MS));
  return true;
}
