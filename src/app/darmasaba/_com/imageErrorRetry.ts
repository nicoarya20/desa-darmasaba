export const MAX_IMAGE_RETRIES = 3;
export const IMAGE_RETRY_DELAYS_MS = [400, 1000, 2000];

// Nama file fallback dari src/app/api/[[...slugs]]/_lib/img.ts — dikembalikan
// server saat MinIO gagal diakses. Ini kegagalan asli, jangan diulang.
const FALLBACK_IMAGE_MARKER = "no-image.jpg";

// Dipisah dari komponen React (ImageErrorRetry.tsx) supaya bisa di-unit-test
// langsung tanpa render — pola yang sama dipakai di
// fileStorage/_lib/parseRange.ts untuk alasan yang sama.
//
// scheduleRetry di-inject (default: setTimeout) supaya test bisa pakai fake
// timer tanpa benar-benar menunggu.
export function handleImageLoadError(
  event: Event,
  scheduleRetry: (fn: () => void, delayMs: number) => void = (fn, ms) => setTimeout(fn, ms)
) {
  const target = event.target;
  if (!(target instanceof HTMLImageElement)) return;
  if (target.src.includes(FALLBACK_IMAGE_MARKER)) return;

  const attempt = Number(target.dataset.retryAttempt || "0");
  if (attempt >= MAX_IMAGE_RETRIES) return;

  const nextAttempt = attempt + 1;
  target.dataset.retryAttempt = String(nextAttempt);

  const delay = IMAGE_RETRY_DELAYS_MS[attempt] ?? IMAGE_RETRY_DELAYS_MS[IMAGE_RETRY_DELAYS_MS.length - 1];
  const originalSrc = target.src;

  scheduleRetry(() => {
    // Reload src yang sama (bukan tebak URL baru) — kegagalan yang sedang
    // dimitigasi ada di layer koneksi (TLS/QUIC), bukan file yang salah.
    // Query param `_retry` cuma cache-buster supaya browser tidak
    // menganggap ini request identik dengan yang baru saja gagal; endpoint
    // /api/img/:name mengabaikan param yang tidak dikenal.
    const url = new URL(originalSrc);
    url.searchParams.set("_retry", String(nextAttempt));
    target.src = url.toString();
  }, delay);
}

export function attachImageErrorRetry(): () => void {
  document.addEventListener("error", handleImageLoadError, true);
  return () => document.removeEventListener("error", handleImageLoadError, true);
}
