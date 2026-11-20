/** Konstanta section Desa Anti Korupsi beranda: jumlah butir dan rute. Warna brand dari token --c-brand. */

/** Jumlah indikator yang tampil di beranda (sisanya di halaman detail). */
export const ANTIKORUPSI_LIMIT = 6;

export const ANTIKORUPSI_DETAIL_HREF = "/desa-anti-korupsi/detail";

/**
 * Susunan kerangka saat memuat, meniru 6 indikator pertama data saat ini: grup = kategori (5 Penguatan Tata Laksana +
 * 1 Penguatan Pengawasan), angka = panjang teks tiap indikator (karakter). Jumlah grup menentukan padding/garis/judul
 * panel dan panjang teks menentukan jumlah baris per butir, jadi keduanya ditiru, bukan 6 baris rata.
 * Angka dikalibrasi ke jumlah baris aslinya di lebar 390 & 1440 (lebar huruf teks contoh ≠ teks asli).
 * Total butir harus = ANTIKORUPSI_LIMIT.
 */
export const ANTIKORUPSI_SKELETON_GROUPS = [[142, 90, 102, 118, 79], [62]] as const;

/** Panjang teks contoh kerangka (karakter): nama kategori 20-22, nomor "1.1". */
export const ANTIKORUPSI_SKELETON_CHARS = { kategori: 22, number: 3 } as const;
