/** Konstanta section SDGs Desa beranda: sumber data, jumlah kartu, rute. Warna dari token CSS (sdgs.module.css). */

export const SDGS_FIND_MANY_URL = "/api/landingpage/sdgsdesa/findMany";

/** Jumlah tujuan berskor tertinggi yang ditampilkan di beranda. */
export const SDGS_TOP_LIMIT = 4;

export const SDGS_DETAIL_HREF = "/sdgs-desa";

/**
 * Panjang nama tujuan (karakter) per kartu kerangka, meniru 4 teratas data saat ini: satu nama panjang ("Desa
 * Berenergi Bersih Dan Terbarukan", 36) + tiga pendek (21-24). Di ponsel tiap kartu setinggi namanya sendiri, di
 * desktop sebaris setinggi nama terpanjang, jadi pola panjang/pendek ini yang membuat tinggi kerangka = isi.
 * Jumlah entri = jumlah kartu kerangka, harus = SDGS_TOP_LIMIT.
 */
export const SDGS_SKELETON_NAME_CHARS = [36, 22, 22, 22] as const;

/** Panjang label & nilai skor kerangka (karakter): "Skor" dan mis. "78.65". */
export const SDGS_SKELETON_SCORE_CHARS = { label: 4, value: 5 } as const;
