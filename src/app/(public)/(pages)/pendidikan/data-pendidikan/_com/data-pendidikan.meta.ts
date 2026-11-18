/**
 * Semua kategori dimuat sekaligus (biasanya 4–8 jenjang), karena total dan persen butuh seluruh baris.
 * API find-many tetap berpaginasi (bawaan 10); 100 jauh di atas jumlah jenjang yang masuk akal.
 */
export const DATA_PENDIDIKAN_LIMIT = 100;
