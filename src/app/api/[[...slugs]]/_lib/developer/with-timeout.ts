export const PING_TIMEOUT_MS = 5000;

export class TimeoutError extends Error {
  constructor() {
    super("timeout");
    this.name = "TimeoutError";
  }
}

/** Menolak dengan `TimeoutError` bila `promise` belum selesai dalam `ms`; timer selalu dibersihkan. */
export async function withTimeout<T>(promise: Promise<T>, ms: number = PING_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new TimeoutError()), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
