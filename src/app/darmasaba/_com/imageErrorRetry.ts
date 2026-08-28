export const MAX_IMAGE_RETRIES = 3;
export const IMAGE_RETRY_DELAYS_MS = [400, 1000, 2000];

// Nama file fallback dari src/app/api/[[...slugs]]/_lib/img.ts — dikembalikan
// server saat MinIO gagal diakses. Ini kegagalan asli, jangan diulang.
const FALLBACK_IMAGE_MARKER = "no-image.jpg";

// Cache hasil feature-detect supaya canvas cuma dibuat sekali per page load,
// bukan tiap kali ada <img> yang error.
let cachedWebpSupport: boolean | null = null;

// Deteksi dukungan WebP browser murni lewat canvas, tanpa request jaringan.
// Safari pra-versi 14 (rilis September 2020) tidak bisa decode WebP sama
// sekali — ini kegagalan yang deterministic, beda dari retry SSL/QUIC di
// bawah yang sifatnya intermittent.
export function supportsWebp(): boolean {
  if (cachedWebpSupport !== null) return cachedWebpSupport;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    cachedWebpSupport = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    cachedWebpSupport = false;
  }
  return cachedWebpSupport;
}

function isWebpUrl(src: string): boolean {
  try {
    return new URL(src).pathname.toLowerCase().endsWith(".webp");
  } catch {
    return false;
  }
}

// Dipisah dari komponen React (ImageErrorRetry.tsx) supaya bisa di-unit-test
// langsung tanpa render — pola yang sama dipakai di
// fileStorage/_lib/parseRange.ts untuk alasan yang sama.
//
// scheduleRetry di-inject (default: setTimeout) supaya test bisa pakai fake
// timer tanpa benar-benar menunggu. isWebpSupported di-inject dengan alasan
// yang sama supaya test bisa mensimulasikan browser lawas tanpa canvas asli.
export function handleImageLoadError(
  event: Event,
  scheduleRetry: (fn: () => void, delayMs: number) => void = (fn, ms) => setTimeout(fn, ms),
  isWebpSupported: () => boolean = supportsWebp
) {
  const target = event.target;
  if (!(target instanceof HTMLImageElement)) return;
  if (target.src.includes(FALLBACK_IMAGE_MARKER)) return;

  // Kegagalan deterministic (browser tidak bisa decode WebP sama sekali) —
  // langsung minta versi JPEG/PNG dari server, bukan diulang dengan URL
  // yang sama (retry di bawah tidak akan pernah berhasil untuk kasus ini).
  // Ditandai lewat flag terpisah dari retryAttempt supaya cuma dipicu sekali
  // per gambar, dan tidak ikut kena batas MAX_IMAGE_RETRIES.
  if (
    !target.dataset.webpFallbackApplied &&
    isWebpUrl(target.src) &&
    !isWebpSupported()
  ) {
    target.dataset.webpFallbackApplied = "1";
    const url = new URL(target.src);
    url.searchParams.set("format", "jpeg");
    target.src = url.toString();
    return;
  }

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
