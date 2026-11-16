// Riwayat login (LoginLog): dicatat dari hook after sign-in Better Auth, dihapus setelah 90 hari.
// Scheduler in-app: sekali tertunda setelah start lalu tiap 24 jam, hanya di production. Idempoten.
import prisma from "@/lib/prisma";
import {
  JENNA_PURGE_INTERVAL_MS,
  JENNA_PURGE_JEDA_AWAL_MS,
  isJennaRetentionSchedulerEnabled,
  type Timers,
  unref,
} from "@/lib/jenna/chat/retention";

export const LOGIN_LOG_RESULTS = ["success", "blocked_inactive"] as const;
export type LoginLogResult = (typeof LOGIN_LOG_RESULTS)[number];

const MAX_USER_AGENT = 512;
const DAY_MS = 86_400_000;
export const LOGIN_LOG_RETENTION_DAYS = 90;

export type LoginLogInput = {
  userId: string | null;
  email?: string | null;
  roleId?: string | null;
  result: LoginLogResult;
  ipAddress?: string | null;
  userAgent?: string | null;
};

/** Catat satu percobaan login. Best-effort: tidak pernah melempar. */
export async function recordLogin(input: LoginLogInput): Promise<void> {
  try {
    await prisma.loginLog.create({
      data: {
        userId: input.userId,
        email: input.email ?? null,
        roleId: input.roleId ?? null,
        result: input.result,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ? input.userAgent.slice(0, MAX_USER_AGENT) : null,
      },
    });
  } catch (err) {
    console.warn(`[login-log] gagal mencatat login ${input.result}`, err);
  }
}

/** Hapus LoginLog lebih lama dari 90 hari; kembalikan jumlah yang dihapus. */
export async function purgeLoginLogs(now: Date = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - LOGIN_LOG_RETENTION_DAYS * DAY_MS);
  const { count } = await prisma.loginLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
  if (count > 0) console.info(`[login-log] Retensi: ${count} riwayat login dihapus (lebih lama dari ${LOGIN_LOG_RETENTION_DAYS} hari)`);
  return count;
}

type StartOptions = {
  run?: () => Promise<unknown>;
  env?: Record<string, string | undefined>;
  timers?: Timers;
  /** Penanda global agar hot reload / register() ganda tidak memasang timer dobel. */
  store?: { __loginLogRetentionScheduler?: boolean };
};

/** Pasang timer retensi LoginLog (sekali per proses). Mengembalikan true bila timer baru dipasang. */
export function startLoginLogRetentionScheduler({
  run = () => purgeLoginLogs(),
  env = process.env,
  timers = { setTimeout, setInterval },
  store = globalThis as { __loginLogRetentionScheduler?: boolean },
}: StartOptions = {}): boolean {
  if (!isJennaRetentionSchedulerEnabled(env) || store.__loginLogRetentionScheduler) return false;
  store.__loginLogRetentionScheduler = true;

  const tick = () => {
    run().catch((error: unknown) => {
      console.error("[login-log] Retensi terjadwal gagal; dicoba lagi pada jadwal berikutnya:", error);
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
