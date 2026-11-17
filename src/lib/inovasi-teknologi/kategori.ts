/**
 * Kategori Inovasi Teknologi Desa (kolom `kategori` model InovasiTeknologiDesa, tabel "DesaDigital"). Dipakai API,
 * admin, halaman publik, pencarian, dan Jenna. Daftar nilai WAJIB sama dengan CHECK constraint migrasi
 * 20261116120000_inovasi_teknologi_desa — menambah kategori berarti migrasi baru.
 */
export const INOVASI_KATEGORI = ["digital", "tepat-guna"] as const;

export type InovasiKategori = (typeof INOVASI_KATEGORI)[number];

/** Kategori bawaan saat klien tidak mengirim `kategori` (sama dengan DEFAULT kolom). */
export const INOVASI_KATEGORI_DEFAULT: InovasiKategori = "digital";

/** Label tampilan per kategori (nama dua menu lama). */
export const INOVASI_KATEGORI_LABEL: Readonly<Record<InovasiKategori, string>> = {
  digital: "Desa Digital / Smart Village",
  "tepat-guna": "Teknologi Tepat Guna",
};

/** Benar bila `value` salah satu kategori yang sah. */
export function isInovasiKategori(value: unknown): value is InovasiKategori {
  return typeof value === "string" && (INOVASI_KATEGORI as readonly string[]).includes(value);
}

/** Label kategori; nilai tak dikenal/kosong → string kosong (kartu tampil tanpa label). */
export function inovasiKategoriLabel(value: unknown): string {
  return isInovasiKategori(value) ? INOVASI_KATEGORI_LABEL[value] : "";
}
