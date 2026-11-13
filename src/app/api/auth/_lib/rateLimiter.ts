import { createLimiter } from "@/lib/rate-limit";

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
