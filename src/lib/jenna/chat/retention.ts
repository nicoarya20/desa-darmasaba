// Retensi percakapan Jenna publik: percakapan tanpa aktivitas > retentionDays dihapus (pesan ikut, cascade),
// begitu juga sesi suara tertutup yang dimulai lebih dari retentionDays lalu.
// Scheduler in-app: sekali tertunda setelah start lalu tiap 24 jam, hanya di production. Idempoten.
import prisma from "@/lib/prisma";
import { JENNA_SETTINGS_ID, toSettingsDTO } from "../mappers";
import { deleteVoiceSessionsBefore } from "../voice/voice.repo";
import { deleteConversationsBefore } from "./conversation.repo";

const DAY_MS = 86_400_000;
export const JENNA_PURGE_JEDA_AWAL_MS = 10 * 60 * 1000;
export const JENNA_PURGE_INTERVAL_MS = DAY_MS;

export interface PurgeDeps {
  loadRetentionDays: () => Promise<number>;
  deleteBefore: (cutoff: Date) => Promise<number>;
  /** Sesi suara yang dimulai sebelum `cutoff` dan sudah ditutup. */
  deleteVoiceSessionsBefore: (cutoff: Date) => Promise<number>;
  now?: () => Date;
}

const defaultPurgeDeps: PurgeDeps = {
  loadRetentionDays: async () =>
    toSettingsDTO(await prisma.jennaSettings.findUnique({ where: { id: JENNA_SETTINGS_ID } })).retentionDays,
  deleteBefore: deleteConversationsBefore,
  deleteVoiceSessionsBefore,
};

/** Jumlah percakapan yang dihapus (sesi suara dihapus bersama, dicatat terpisah). */
export async function purgeExpiredJennaConversations(d: PurgeDeps = defaultPurgeDeps): Promise<number> {
  const days = await d.loadRetentionDays();
  if (!Number.isFinite(days) || days < 1) return 0;
  const cutoff = new Date((d.now?.() ?? new Date()).getTime() - days * DAY_MS);
  const deleted = await d.deleteBefore(cutoff);
  if (deleted > 0) console.info(`[jenna] Retensi: ${deleted} percakapan dihapus (lebih lama dari ${days} hari)`);
  const voice = await d.deleteVoiceSessionsBefore(cutoff);
  if (voice > 0) console.info(`[jenna] Retensi: ${voice} sesi suara dihapus (lebih lama dari ${days} hari)`);
  return deleted;
}

/** Hidup hanya di production dan tidak saat `next build`. */
export function isJennaRetentionSchedulerEnabled(env: Record<string, string | undefined>): boolean {
  return env.NEXT_PHASE !== "phase-production-build" && env.NODE_ENV === "production";
}

type TimerHandle = { unref?: () => unknown } | number | undefined;
export type Timers = {
  setTimeout: (fn: () => void, ms: number) => TimerHandle;
  setInterval: (fn: () => void, ms: number) => TimerHandle;
};

export const unref = (handle: TimerHandle) => {
  if (handle && typeof handle === "object") handle.unref?.();
};

type StartOptions = {
  run?: () => Promise<unknown>;
  env?: Record<string, string | undefined>;
  timers?: Timers;
  /** Penanda global agar hot reload / register() ganda tidak memasang timer dobel. */
  store?: { __jennaRetentionScheduler?: boolean };
};

/** Pasang timer retensi (sekali per proses). Mengembalikan true bila timer baru dipasang. */
export function startJennaRetentionScheduler({
  run = () => purgeExpiredJennaConversations(),
  env = process.env,
  timers = { setTimeout, setInterval },
  store = globalThis as { __jennaRetentionScheduler?: boolean },
}: StartOptions = {}): boolean {
  if (!isJennaRetentionSchedulerEnabled(env) || store.__jennaRetentionScheduler) return false;
  store.__jennaRetentionScheduler = true;

  const tick = () => {
    run().catch((error: unknown) => {
      console.error("[jenna] Retensi terjadwal gagal; dicoba lagi pada jadwal berikutnya:", error);
    });
  };
  unref(
    timers.setTimeout(() => {
      tick();
      unref(timers.setInterval(tick, JENNA_PURGE_INTERVAL_MS));
    }, JENNA_PURGE_JEDA_AWAL_MS),
  );
  return true;
}
