/**
 * Konstanta kalender Bali (Saka & pawukon) di halaman Agenda: ejaan tampilan, tingkat rerainan, dan
 * rerainan tambahan yang tidak dihitung pustaka `balinese-date-js-lib`. Hanya fakta tanggal & nama —
 * tidak ada penjelasan makna hari raya maupun dewasa ayu.
 */

/**
 * Ejaan tampilan. `pustaka` = ejaan dari balinese-date-js-lib, `tampil` = yang ditampilkan ke warga,
 * `varian` = ejaan lain yang lazim (dipakai menyamakan nama saat membandingkan dengan agenda admin).
 * `sumber` mencatat asal tiap ejaan.
 */
export const EJAAN_BALI: readonly { pustaka: string; tampil: string; varian: readonly string[]; sumber: string }[] = [
  // Rerainan
  { pustaka: 'Sabuh Emas', tampil: 'Sabuh Mas', varian: [], sumber: 'Tampil: kalenderbali.org & kalender cetak Bali; pustaka: Sabuh Emas.' },
  { pustaka: 'Pager Wesi', tampil: 'Pagerwesi', varian: [], sumber: 'Tampil: kalenderbali.org & PHDI; pustaka: Pager Wesi.' },
  { pustaka: 'Siwa Ratri', tampil: 'Siwaratri', varian: ['Siwa Latri'], sumber: 'Tampil: penulisan umum (PHDI); pustaka & kalenderbali.org: Siwa Ratri.' },
  { pustaka: 'Anggara Kasih', tampil: 'Anggara Kasih', varian: ['Anggar Kasih'], sumber: 'Pustaka; kalenderbali.org: Anggar Kasih <wuku>.' },
  { pustaka: 'Buda Cemeng', tampil: 'Buda Cemeng', varian: ['Buda Wage'], sumber: 'Pustaka; kalenderbali.org: Buda Wage <wuku>.' },
  { pustaka: 'Kliwon', tampil: 'Kliwon', varian: ['Keliwon'], sumber: 'Pustaka; kalenderbali.org: Keliwon (mis. Kajeng Keliwon).' },
  { pustaka: 'Penyajan Galungan', tampil: 'Penyajan Galungan', varian: ['Penyajaan Galungan'], sumber: 'Pustaka; kalenderbali.org: Penyajaan.' },
  { pustaka: 'Penyekeban Galungan', tampil: 'Penyekeban Galungan', varian: ['Penyekeban'], sumber: 'Pustaka; kalenderbali.org: Hari Penyekeban.' },
  {
    pustaka: 'Pegat Uwakan',
    tampil: 'Pegat Uwakan',
    varian: ['Buda Keliwon Pegatuwakan', 'Buda Kliwon Pegatuwakan', 'Pegatuwakan'],
    sumber: 'Pustaka; kalenderbali.org: Buda Keliwon Pegatuwakan (17 Feb 2027).',
  },
  { pustaka: 'Klawu', tampil: 'Klawu', varian: ['Kulawu'], sumber: 'Pustaka (nama wuku); kalenderbali.org: Kulawu.' },
  // Sasih
  { pustaka: 'Katiga', tampil: 'Katiga', varian: ['Ketiga'], sumber: 'Pustaka; kalenderbali.org: Ketiga.' },
  { pustaka: 'Kalima', tampil: 'Kalima', varian: ['Kelima'], sumber: 'Pustaka; kalenderbali.org: Kelima.' },
  { pustaka: 'Kanem', tampil: 'Kanem', varian: ['Kenam'], sumber: 'Pustaka; kalenderbali.org: Kenam.' },
  { pustaka: 'Kapitu', tampil: 'Kapitu', varian: ['Kepitu'], sumber: 'Pustaka; kalenderbali.org: Kepitu.' },
  { pustaka: 'Kawolu', tampil: 'Kawolu', varian: ['Kewulu', 'Kaulu'], sumber: 'Pustaka; kalenderbali.org: Kewulu.' },
  { pustaka: 'Kasanga', tampil: 'Kasanga', varian: ['Kesanga'], sumber: 'Pustaka; kalenderbali.org: Kesanga.' },
  { pustaka: 'Kadasa', tampil: 'Kadasa', varian: ['Kedasa'], sumber: 'Pustaka; kalenderbali.org: Kedasa.' },
  { pustaka: 'Destha', tampil: 'Jiyestha', varian: ['Jyestha', 'Desta'], sumber: 'Tampil: kalenderbali.org & penulisan umum; pustaka: Destha.' },
  { pustaka: 'Nampih', tampil: 'Mala', varian: [], sumber: 'Tampil: kalenderbali.org (sasih sisipan), mis. Mala Jiyestha Mei–Jun 2027; pustaka: Nampih.' },
];

/** Rerainan pustaka yang berulang rutin (siklus 15/35 hari & bulan) — tampil lebih tenang dari hari raya. */
export const RERAINAN_RUTIN_PUSTAKA: readonly string[] = ['Kajeng Kliwon', 'Purnama', 'Tilem', 'Buda Cemeng', 'Anggara Kasih'];

/** Wewaran pemicu rerainan tambahan (nama ejaan pustaka). */
export type AturanRerainan = {
  /** Nama tampil; `{wuku}` diganti nama wuku hari itu. */
  nama: string;
  saptaWara: string;
  pancaWara: string;
  /** Hanya di wuku ini (sekali per 210 hari); kosong = tiap 35 hari. */
  wuku?: string;
  /** Wuku yang dilewati karena hari itu sudah punya nama sendiri di pustaka. */
  kecualiWuku?: readonly string[];
  /** Bawaan rutin; 'besar' untuk hari raya yang tidak dihitung pustaka (mis. Tumpek Krulut). */
  tingkat?: 'besar' | 'rutin';
};

/**
 * Rerainan yang tidak ada di pustaka. Hanya yang aturannya (saptawara + pancawara [+ wuku]) terbukti
 * cocok dengan SEMUA tanggal uji 2026–2027 (lihat __tests__/api/kalender_bali_logic.test.ts).
 * Tingkat rutin kecuali ditandai `tingkat: 'besar'`.
 */
export const RERAINAN_TAMBAHAN: readonly AturanRerainan[] = [
  // Tumpek Krulut tidak ada di pustaka (tumpek lain ada); terbukti 1 Agu 2026 & 27 Feb 2027.
  { nama: 'Tumpek Krulut', saptaWara: 'Saniscara', pancaWara: 'Kliwon', wuku: 'Krulut', tingkat: 'besar' },
  { nama: 'Hari Bhatara Sri', saptaWara: 'Sukra', pancaWara: 'Umanis' },
  // Buda Kliwon Sinta = Pagerwesi, Dungulan = Galungan, Pahang = Pegat Uwakan (sudah dari pustaka).
  { nama: 'Buda Kliwon {wuku}', saptaWara: 'Buda', pancaWara: 'Kliwon', kecualiWuku: ['Sinta', 'Dungulan', 'Pahang'] },
  { nama: 'Redite Umanis Ukir', saptaWara: 'Redite', pancaWara: 'Umanis', wuku: 'Ukir' },
  { nama: 'Soma Umanis Tolu', saptaWara: 'Soma', pancaWara: 'Umanis', wuku: 'Tolu' },
  { nama: 'Soma Paing Warigadean', saptaWara: 'Soma', pancaWara: 'Paing', wuku: 'Warigadean' },
  { nama: 'Buda Paing Kuningan', saptaWara: 'Buda', pancaWara: 'Paing', wuku: 'Kuningan' },
  { nama: 'Anggara Paing Medangkungan', saptaWara: 'Anggara', pancaWara: 'Paing', wuku: 'Medangkungan' },
  { nama: 'Watugunung Runtuh', saptaWara: 'Redite', pancaWara: 'Kliwon', wuku: 'Watugunung' },
  { nama: 'Paid-paidan', saptaWara: 'Anggara', pancaWara: 'Paing', wuku: 'Watugunung' },
];

/** Kata pembuka yang diabaikan saat menyamakan nama agenda admin dengan rerainan. */
export const KATA_PEMBUKA_RERAINAN: readonly string[] = ['hari raya', 'rahina', 'hari'];

/** Jangkauan pencarian "Rerainan berikutnya" (hari) — hari raya besar paling jarang ±35 hari. */
export const RERAINAN_CARI_HARI = 70;

/** Rerainan maksimal yang ditulis per sel kalender bulan desktop; sisanya "+N" (lengkap di modal hari). */
export const RERAINAN_SEL_MAKS = 2;
