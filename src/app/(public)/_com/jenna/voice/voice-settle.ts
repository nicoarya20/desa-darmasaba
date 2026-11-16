// Kapan giliran GPT-Live dianggap selesai bicara: setelah jawaban dikirim, tunggu minimal `minWaitMs`,
// lalu tutup begitu audio hening `quietMs` (jawaban panjang tidak terpotong), dengan batas keras `maxWaitMs`.

export interface SettleConfig {
  minWaitMs: number;
  quietMs: number;
  maxWaitMs: number;
  pollMs: number;
}

export const SETTLE_DEFAULTS: SettleConfig = {
  minWaitMs: 10_000,
  quietMs: 1500,
  maxWaitMs: 90_000,
  pollMs: 500,
};

export function isSettled(
  sentAt: number,
  lastAudibleAt: number,
  now: number,
  cfg: SettleConfig = SETTLE_DEFAULTS,
): boolean {
  if (now - sentAt >= cfg.maxWaitMs) return true;
  return now - sentAt >= cfg.minWaitMs && now - lastAudibleAt >= cfg.quietMs;
}

export interface SettleWatcher {
  /** Audio GPT-Live terdengar pada `at`. */
  heard(at: number): void;
  /** Panggil `done` sekali saat giliran yang jawabannya dikirim pada `sentAt` selesai bicara. */
  wait(sentAt: number, done: () => void): void;
  stopAll(): void;
}

export function createSettleWatcher(
  now: () => number = () => performance.now(),
  cfg: SettleConfig = SETTLE_DEFAULTS,
): SettleWatcher {
  let lastAudibleAt = Number.NEGATIVE_INFINITY;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  return {
    heard(at) {
      lastAudibleAt = at;
    },
    wait(sentAt, done) {
      const tick = () => {
        const timer = setTimeout(() => {
          timers.delete(timer);
          if (isSettled(sentAt, lastAudibleAt, now(), cfg)) done();
          else tick();
        }, cfg.pollMs);
        timers.add(timer);
      };
      tick();
    },
    stopAll() {
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
    },
  };
}
