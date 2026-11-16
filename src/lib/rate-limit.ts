// In-memory sliding window rate limiter — single-instance only.
// Resets on container restart (acceptable for single-instance Docker deployment).

type WindowStore = Map<string, number[]>;

export type RateLimitResult = { allowed: boolean; retryAfterMs: number; remaining: number };

type Sweepable = { sweep(now: number): void };

const SWEEP_INTERVAL_MS = 60_000;

// Satu timer per proses (globalThis) agar HMR dev tidak menumpuk interval. Limiter didaftarkan lewat
// WeakRef sehingga instance lama dari modul yang di-reload bisa di-GC.
type SweeperState = { timer?: ReturnType<typeof setInterval>; limiters: Set<WeakRef<Sweepable>> };
const globalSweeper = globalThis as typeof globalThis & { __rateLimitSweeper?: SweeperState };

function registerForSweep(limiter: Sweepable) {
  const state = (globalSweeper.__rateLimitSweeper ??= { limiters: new Set() });
  state.limiters.add(new WeakRef(limiter));
  if (state.timer) return;
  state.timer = setInterval(() => {
    const now = Date.now();
    for (const ref of state.limiters) {
      const live = ref.deref();
      if (live) live.sweep(now);
      else state.limiters.delete(ref);
    }
  }, SWEEP_INTERVAL_MS);
  // Jangan menahan proses tetap hidup (test runner, skrip) hanya karena timer pembersih.
  state.timer.unref?.();
}

/** `maxRequests` = batas default; `check(key, max)` boleh memberi batas per panggilan (setelan runtime). */
export function createLimiter(maxRequests: number, windowMs: number) {
  const store: WindowStore = new Map();

  const limiter = {
    // Consumes one slot. remaining=0 means this was the last allowed slot.
    check(key: string, max: number = maxRequests, now: number = Date.now()): RateLimitResult {
      const cutoff = now - windowMs;
      const timestamps = (store.get(key) ?? []).filter((t) => t > cutoff);

      if (timestamps.length >= max) {
        const retryAfterMs = timestamps.length > 0 ? windowMs - (now - timestamps[0]) : windowMs;
        return { allowed: false, retryAfterMs, remaining: 0 };
      }

      timestamps.push(now);
      store.set(key, timestamps);
      return { allowed: true, retryAfterMs: 0, remaining: max - timestamps.length };
    },

    reset(key: string) {
      store.delete(key);
    },

    /** Buang timestamp kedaluwarsa; kunci tanpa sisa dihapus (dipanggil timer global). */
    sweep(now: number = Date.now()) {
      const cutoff = now - windowMs;
      for (const [key, timestamps] of store) {
        const fresh = timestamps.filter((t) => t > cutoff);
        if (fresh.length === 0) store.delete(key);
        else store.set(key, fresh);
      }
    },

    get size() {
      return store.size;
    },
  };
  registerForSweep(limiter);
  return limiter;
}

export type Limiter = ReturnType<typeof createLimiter>;
