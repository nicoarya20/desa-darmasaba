/*
 * Kapan splash diputar: hanya bila beranda adalah halaman pendaratan dan splash belum
 * dilihat di tab ini (sessionStorage). Keputusan dibuat skrip inline di <head> SEBELUM
 * paint lewat atribut <html data-gate-splash>, jadi pengunjung yang tak perlu splash
 * tidak melihat kedipan layar biru. CSS menampilkan splash hanya saat nilainya "play".
 */

export const GATE_SPLASH_ATTR = "data-gate-splash";
export const GATE_SPLASH_STORAGE_KEY = "darmasaba:gate-splash-seen";
/** Path pendaratan yang memutar splash (`/` sudah redirect server ke sini). */
export const GATE_SPLASH_LANDING_PATHS = ["/darmasaba"] as const;

export type GateSplashState = "play" | "skip" | "done";

/**
 * Skrip <head>. Bila sessionStorage diblokir (mode privat ketat), splash tetap diputar:
 * tak ada cara mengingatnya, dan memutar ulang lebih aman daripada menebak "sudah dilihat".
 */
export const GATE_SPLASH_HEAD_SCRIPT = `(function(a,k,p){var s="skip";var path=location.pathname.replace(/\\/+$/,"")||"/";if(p.indexOf(path)>-1){try{s=sessionStorage.getItem(k)==="1"?"skip":"play"}catch(e){s="play"}}document.documentElement.setAttribute(a,s)})(${JSON.stringify(
  GATE_SPLASH_ATTR,
)},${JSON.stringify(GATE_SPLASH_STORAGE_KEY)},${JSON.stringify(GATE_SPLASH_LANDING_PATHS)})`;

/** Status splash untuk dokumen ini, ditulis skrip <head> (null bila skrip tak berjalan). */
export function readGateSplashState(doc: Document = document): GateSplashState | null {
  const value = doc.documentElement.getAttribute(GATE_SPLASH_ATTR);
  return value === "play" || value === "skip" || value === "done" ? value : null;
}

/** Tandai splash selesai: sembunyikan sekarang & jangan putar lagi di tab ini. */
export function markGateSplashSeen(doc: Document = document, storage?: Storage): void {
  doc.documentElement.setAttribute(GATE_SPLASH_ATTR, "done");
  try {
    (storage ?? window.sessionStorage).setItem(GATE_SPLASH_STORAGE_KEY, "1");
  } catch (e) {
    // Non-fatal: splash sudah disembunyikan, hanya akan diputar lagi saat beranda dimuat ulang.
    console.warn("Gagal menyimpan status splash di sessionStorage:", e);
  }
}
