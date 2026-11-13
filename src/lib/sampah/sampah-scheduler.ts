// Scheduler in-app purge Sampah: sekali tertunda setelah server start, lalu tiap 24 jam. Hanya jalan selama
// proses Node hidup (tidak ada cron/infra). Lihat docs/decisions/2026-11-12-sampah.md.

/** Jeda purge pertama setelah start (beri waktu server & koneksi DB siap). */
export const SAMPAH_PURGE_JEDA_AWAL_MS = 5 * 60 * 1000;
/** Interval purge berikutnya. */
export const SAMPAH_PURGE_INTERVAL_MS = 24 * 60 * 60 * 1000;
/** Env saklar scheduler: "on" | "off". Kosong → on hanya di production. */
export const SAMPAH_PURGE_SCHEDULER_ENV = "SAMPAH_PURGE_SCHEDULER";

/** Scheduler aktif? Eksplisit lewat env; default hidup di production, mati di development/test & saat `next build`. */
export function isSampahSchedulerEnabled(env: Record<string, string | undefined>): boolean {
  if (env.NEXT_PHASE === "phase-production-build") return false;
  const flag = env[SAMPAH_PURGE_SCHEDULER_ENV]?.trim().toLowerCase();
  if (flag === "on") return true;
  if (flag === "off") return false;
  return env.NODE_ENV === "production";
}

type TimerHandle = { unref?: () => unknown } | number | undefined;
type Timers = {
  setTimeout: (fn: () => void, ms: number) => TimerHandle;
  setInterval: (fn: () => void, ms: number) => TimerHandle;
};

/** Timer tidak menahan proses tetap hidup (server HTTP yang menahannya); aman bila register() terpanggil di luar server. */
const unref = (handle: TimerHandle) => {
  if (handle && typeof handle === "object") handle.unref?.();
};

type StartOptions = {
  run: () => Promise<unknown>;
  env?: Record<string, string | undefined>;
  timers?: Timers;
  /** Penanda global agar hot reload / register() ganda tidak memasang timer dobel. */
  store?: { __sampahPurgeScheduler?: boolean };
};

/**
 * Pasang timer purge (sekali per proses). Error purge dicatat dengan konteks dan tidak menghentikan server.
 * Mengembalikan true bila timer baru dipasang.
 */
export function startSampahScheduler({
  run,
  env = process.env,
  timers = { setTimeout, setInterval },
  store = globalThis as { __sampahPurgeScheduler?: boolean },
}: StartOptions): boolean {
  if (!isSampahSchedulerEnabled(env) || store.__sampahPurgeScheduler) return false;
  store.__sampahPurgeScheduler = true;

  const tick = () => {
    run().catch((error: unknown) => {
      console.error("[sampah] Purge terjadwal gagal; dicoba lagi pada jadwal berikutnya:", error);
    });
  };
  unref(
    timers.setTimeout(() => {
      tick();
      unref(timers.setInterval(tick, SAMPAH_PURGE_INTERVAL_MS));
    }, SAMPAH_PURGE_JEDA_AWAL_MS),
  );
  console.info(
    `[sampah] Scheduler purge aktif: pertama ${SAMPAH_PURGE_JEDA_AWAL_MS / 60000} menit lagi, lalu tiap ${SAMPAH_PURGE_INTERVAL_MS / 3600000} jam`,
  );
  return true;
}
