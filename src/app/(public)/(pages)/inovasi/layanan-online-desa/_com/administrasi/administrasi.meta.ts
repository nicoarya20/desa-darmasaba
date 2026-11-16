/** Konstanta formulir Administrasi Online (`/inovasi/layanan-online-desa/administrasi-online`). */

/** Jenis layanan dimuat sekali untuk dropdown; master data admin, jumlahnya kecil (stg 2026-11-16: 7). */
export const JENIS_LAYANAN_LIMIT = 100;

/** Batas isian, sama dengan gerbang formulir lama: nama/alamat ≥ 3 karakter, telepon 10–13 digit. */
export const ADMINISTRASI_RULES = {
  minName: 3,
  minAlamat: 3,
  minPhone: 10,
  maxPhone: 13,
} as const;
