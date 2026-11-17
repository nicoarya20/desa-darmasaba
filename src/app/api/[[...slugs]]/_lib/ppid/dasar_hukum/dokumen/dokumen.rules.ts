/** Batas panjang judul satu dokumen Dasar Hukum (karakter). */
export const JUDUL_DOKUMEN_MAX = 200;

/** Batas dokumen aktif yang dikirim daftar & diterima reorder (daftar flat desa hanya puluhan; ini pengaman). */
export const DOKUMEN_DASAR_HUKUM_MAX = 200;

/** Pesan galat validasi judul dokumen. */
export const PESAN_JUDUL_DOKUMEN = {
  kosong: "Judul dokumen wajib diisi",
  terlaluPanjang: `Judul dokumen maksimal ${JUDUL_DOKUMEN_MAX} karakter`,
  bukanTeksPolos: "Judul dokumen harus teks polos (tanpa tanda < atau >)",
} as const;

/** Hasil validasi judul: judul yang sudah dirapikan, atau pesan galat. */
export type JudulDokumenResult = { ok: true; judul: string } | { ok: false; message: string };

/** Rapikan (trim + satukan spasi berulang) lalu validasi judul dokumen: wajib ada, ≤ JUDUL_DOKUMEN_MAX, teks polos. */
export function validateJudulDokumen(raw: string): JudulDokumenResult {
  const judul = raw.replace(/\s+/g, " ").trim();
  if (!judul) return { ok: false, message: PESAN_JUDUL_DOKUMEN.kosong };
  if (judul.length > JUDUL_DOKUMEN_MAX) return { ok: false, message: PESAN_JUDUL_DOKUMEN.terlaluPanjang };
  if (/[<>]/.test(judul)) return { ok: false, message: PESAN_JUDUL_DOKUMEN.bukanTeksPolos };
  return { ok: true, judul };
}

/** Judul awal dari nama berkas: ekstensi `.pdf` dibuang, selebihnya apa adanya (dipangkas ke batas panjang). */
export function judulDariNamaFile(namaFile: string): string {
  return namaFile.replace(/\.pdf$/i, "").trim().slice(0, JUDUL_DOKUMEN_MAX);
}
