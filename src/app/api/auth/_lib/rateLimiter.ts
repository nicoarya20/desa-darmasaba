// In-memory sliding window rate limiter — single-instance only
// Resets on container restart (acceptable for single-instance Docker deployment)

type WindowStore = Map<string, number[]>

function createLimiter(maxRequests: number, windowMs: number) {
  const store: WindowStore = new Map()

  // Periodic cleanup to prevent unbounded memory growth
  const cleanup = () => {
    const cutoff = Date.now() - windowMs
    for (const [key, timestamps] of store) {
      const fresh = timestamps.filter((t) => t > cutoff)
      if (fresh.length === 0) store.delete(key)
      else store.set(key, fresh)
    }
  }
  setInterval(cleanup, windowMs)

  return {
    // Consumes one slot. remaining=0 means this was the last allowed slot.
    check(key: string): { allowed: boolean; retryAfterMs: number; remaining: number } {
      const now = Date.now()
      const cutoff = now - windowMs
      const timestamps = (store.get(key) ?? []).filter((t) => t > cutoff)

      if (timestamps.length >= maxRequests) {
        const retryAfterMs = windowMs - (now - timestamps[0])
        return { allowed: false, retryAfterMs, remaining: 0 }
      }

      timestamps.push(now)
      store.set(key, timestamps)
      return { allowed: true, retryAfterMs: 0, remaining: maxRequests - timestamps.length }
    },

    reset(key: string) {
      store.delete(key)
    },
  }
}

// Max 3 OTP sends per nomor per 10 minutes (prevents WA spam)
export const otpSendLimiter = createLimiter(3, 10 * 60 * 1000)

// Max 5 verify attempts per kodeId per 15 minutes (prevents OTP brute-force)
export const otpVerifyLimiter = createLimiter(5, 15 * 60 * 1000)

export function rateLimitResponse(retryAfterMs: number) {
  const retrySec = Math.ceil(retryAfterMs / 1000)
  return Response.json(
    { success: false, message: `Terlalu banyak percobaan. Coba lagi dalam ${retrySec} detik.` },
    { status: 429, headers: { 'Retry-After': String(retrySec) } }
  )
}
