// Logika murni (tanpa I/O) penggabungan gelar ke nama pegawai struktur organisasi.

/** Panjang maksimal `namaLengkap` (kolom @db.VarChar(255) di semua tabel pegawai struktur). */
const MAX_NAMA = 255;

/** Bentuk pembanding: huruf kecil tanpa spasi (sama dengan `REPLACE(LOWER(...), ' ', '')` di SQL). */
const comparable = (value: string) => value.toLowerCase().replace(/ /g, '');

/**
 * Gabungkan gelar ke nama ("I Made Ari" + "S.Kom" → "I Made Ari, S.Kom") dengan aturan yang sama dengan migrasi
 * `20261112180000_struktur_fleksibel`: gelar kosong → nama apa adanya; nama yang sudah memuat gelarnya
 * (tanpa beda spasi/huruf besar-kecil) tidak digandakan; hasil dipotong ke 255 karakter.
 */
export function gabungGelarKeNama(nama: string, gelar: string | null | undefined): string {
  const gelarBersih = gelar?.trim() ?? '';
  if (!gelarBersih) return nama;
  if (comparable(nama).includes(comparable(gelarBersih))) return nama;
  return Array.from(`${nama.trim()}, ${gelarBersih}`).slice(0, MAX_NAMA).join('');
}
