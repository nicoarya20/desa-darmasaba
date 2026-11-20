/**
 * Lambang desa & logo Pudak versi WebP seukuran tampil, khusus situs publik.
 *
 * Kenapa bukan PNG asli: `darmasaba-icon.png` (238px, 101 KB) dan `pudak-icon.png` (491px, 48 KB) tampil hanya
 * 28–140px, padahal React memuatnya lebih dulu (preload prioritas tinggi) sehingga bersaing dengan CSS & foto LCP.
 * Splash & transisi tema ikut memakai WebP. PNG asli tetap ada karena dipakai metadata icon/manifest
 * (src/app/layout.tsx, public/manifest.json) dan admin.
 */

/** Navbar (28–32px) dan hero beranda (32–40px): 128px cukup sampai layar 3x. Near-lossless agar garis tipis tetap tajam. */
export const LOGO_DESA_SMALL_SRC = "/assets/images/logo-desa-128.webp";

/** Kartu Visi Misi, Profil PPID, Lambang Desa (70–140px), splash & transisi tema (54–122px): resolusi asli 238px, karena berkas sumber tak lebih besar. */
export const LOGO_DESA_LARGE_SRC = "/assets/images/logo-desa-238.webp";

/** Logo Pudak di hero beranda (32–40px). */
export const LOGO_PUDAK_SMALL_SRC = "/assets/images/logo-pudak-128.webp";
