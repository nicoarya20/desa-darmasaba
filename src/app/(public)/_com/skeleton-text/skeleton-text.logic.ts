/**
 * Teks contoh untuk kerangka (loading) yang meniru teks asli. Kerangka memakai elemen & kelas yang sama dengan isi
 * aslinya, lalu mengisi slot teks dengan teks contoh tak terlihat sepanjang teks asli yang khas. Teks itu membungkus
 * & terpotong (line-clamp) persis seperti teks asli di tiap lebar layar, jadi tinggi kerangka = tinggi isi tanpa
 * min-height tebakan per breakpoint.
 */

/**
 * Kata contoh bergiliran: kata bahasa Indonesia biasa (bukan "xxxx") supaya lebar huruf & titik potong baris mirip
 * judul/indikator asli; huruf seragam terlalu sempit/lebar dan membuat jumlah baris kerangka meleset dari isi.
 */
const SAMPLE_WORDS = [
  "kegiatan",
  "desa",
  "tentang",
  "pelaksanaan",
  "anggaran",
  "dan",
  "pengawasan",
  "perangkat",
  "dalam",
  "pembangunan",
  "layanan",
  "masyarakat",
  "yang",
  "terbuka",
  "bersama",
  "warga",
] as const;

/**
 * Kata contoh (dipisah spasi agar bisa membungkus) dipotong tepat `chars` karakter (minimal 1), jadi slot pendek
 * seperti nomor "1.1" tidak diisi kata panjang yang meluber dari kolomnya. Spasi di ujung potongan dibiarkan: spasi
 * akhir baris diciutkan browser, jadi tak menambah lebar, dan panjangnya tetap tepat seperti yang diminta.
 */
export function skeletonSample(chars: number): string {
  const target = Math.max(1, Math.floor(chars));
  let text = "";
  for (let i = 0; text.length < target; i++) {
    text += `${SAMPLE_WORDS[i % SAMPLE_WORDS.length]} `;
  }
  return text.slice(0, target);
}
