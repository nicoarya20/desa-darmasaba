/** Hitungan murni teks satu baris: berapa kali ukuran huruf harus diperkecil agar muat di lebarnya. */

/** Cadangan agar pembulatan sub-piksel tidak membuat teks tetap kelebihan sedikit. */
const SAFETY = 0.995;

/** Pengali ukuran huruf (≤ 1) dari lebar tersedia vs lebar teks satu baris; 1 = sudah muat, jangan diperbesar. */
export function fitTextScale(available: number, needed: number): number {
  if (available <= 0 || needed <= available) return 1;
  return (available / needed) * SAFETY;
}
