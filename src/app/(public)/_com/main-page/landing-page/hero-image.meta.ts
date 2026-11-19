/**
 * Lebar `?size=` dan `sizes` untuk gambar CMS kecil di hero (dipakai lewat `responsiveImageProps`).
 * Unggahan admin dilayani 720–1920px padahal tampil puluhan piksel (PageSpeed "Improve image delivery").
 * Daftar lebar sengaja pendek & tetap: tiap lebar unik = satu resize cold di origin + kunci cache CF sendiri.
 * Nilai `sizes` wajib mengikuti CSS (landing.module.css / programs.module.css); ubah keduanya bersamaan.
 */

/** Ikon media sosial tampil tetap 22px (`.sosmedLink .sosmedIcon`): 48 cukup untuk DPR 1–2 (44px), 72 untuk DPR 3 (66px). */
export const SOSMED_ICON_WIDTHS = [48, 72] as const;
export const SOSMED_ICON_SIZES = "22px";

/**
 * Logo program tampil `object-fit: contain` dalam kotak tinggi 72px selebar ubin. Logo lebar (mis. 4:1) mengisi
 * seluruh lebar kotak, jadi yang menentukan ketajaman adalah lebar KOTAK, bukan 72px. Kotak terukur: ponsel 112px;
 * tablet 125–202px (≈ 24vw − 50px); desktop 90px (1069) · 139px (1440) · 205px (1920) · 295px (2560) (≈ 14vw − 58px).
 * 240 menutup semua kotak di DPR 1; 480 menutup DPR 2–3 sampai layar 1920 (410px) dan ponsel @3x (336px).
 */
export const PROGRAM_LOGO_WIDTHS = [240, 480] as const;
export const PROGRAM_LOGO_SIZES =
  "(max-width: 734px) 112px, (max-width: 1068px) calc(24vw - 50px), calc(14vw - 58px)";
