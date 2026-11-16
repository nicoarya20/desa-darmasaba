// Aturan data penerima Program Kemiskinan — fungsi murni, dipakai bersama boundary API dan pratinjau
// impor CSV di admin. Hanya nama + alamat yang disimpan (keputusan user 2026-11-16).

/** Batas panjang nama penerima (karakter, setelah dirapikan). */
export const NAMA_MAKS = 150;
/** Batas panjang alamat penerima (karakter, setelah dirapikan). */
export const ALAMAT_MAKS = 200;
/** Tahun paling awal yang diterima untuk data penerima. */
export const TAHUN_MIN = 2000;
/** Batas baris per sekali impor (satu permintaan). */
export const IMPOR_MAKS_BARIS = 5000;

/** Data penerima yang sudah dirapikan dan valid. */
export type PenerimaInput = { nama: string; alamat: string };

/** Hasil validasi: nilai bersih atau alasan penolakan (bahasa Indonesia, tanpa menyebut isi data). */
export type Validasi<T> = { ok: true; value: T } | { ok: false; alasan: string };

/** Rapikan teks: buang spasi di tepi dan satukan spasi/tab/baris baru beruntun menjadi satu spasi. */
export function rapikanTeks(raw: unknown): string {
  return typeof raw === "string" ? raw.replace(/\s+/g, " ").trim() : "";
}

/** Tahun terbesar yang diterima: tahun berjalan + 1 (data penerima tahun depan boleh disiapkan). */
export function tahunMaks(now: Date = new Date()): number {
  return now.getFullYear() + 1;
}

/** Validasi tahun (bilangan bulat TAHUN_MIN..tahunMaks); terima angka atau string angka. */
export function validasiTahun(raw: unknown, now: Date = new Date()): Validasi<number> {
  const n = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw;
  if (typeof n !== "number" || !Number.isInteger(n)) return { ok: false, alasan: "Tahun wajib berupa angka bulat" };
  if (n < TAHUN_MIN || n > tahunMaks(now)) {
    return { ok: false, alasan: `Tahun harus antara ${TAHUN_MIN} dan ${tahunMaks(now)}` };
  }
  return { ok: true, value: n };
}

/** Validasi satu penerima: nama & alamat wajib, dirapikan, dan tidak melebihi batas panjang. */
export function validasiPenerima(raw: { nama?: unknown; alamat?: unknown }): Validasi<PenerimaInput> {
  const nama = rapikanTeks(raw.nama);
  const alamat = rapikanTeks(raw.alamat);
  if (!nama) return { ok: false, alasan: "Nama wajib diisi" };
  if (nama.length > NAMA_MAKS) return { ok: false, alasan: `Nama maksimal ${NAMA_MAKS} karakter` };
  if (!alamat) return { ok: false, alasan: "Alamat wajib diisi" };
  if (alamat.length > ALAMAT_MAKS) return { ok: false, alasan: `Alamat maksimal ${ALAMAT_MAKS} karakter` };
  return { ok: true, value: { nama, alamat } };
}
