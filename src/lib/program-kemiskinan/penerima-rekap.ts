// Rekap penerima Program Kemiskinan per alamat/banjar dan per tahun — fungsi murni di atas hasil
// groupBy Prisma.

/** Satu baris hasil `groupBy({ by: ["alamat"], _count: { _all: true } })`. */
export type GrupAlamat = { alamat: string; _count: { _all: number } };
/** Jumlah penerima di satu alamat. */
export type RekapAlamatItem = { alamat: string; jumlah: number };
/** Rekap: alamat terbanyak (maks `batas`), jumlah sisanya digabung ke `lainnya`, dan total penerima. */
export type RekapAlamat = { data: RekapAlamatItem[]; lainnya: number; total: number };

/** Batas default baris rekap yang dikirim ke publik (sisanya digabung "Lainnya"). */
export const REKAP_MAKS = 30;

/** Urutkan alamat menurut jumlah terbanyak (seri: abjad), potong ke `batas`, sisa → `lainnya`. */
export function rekapPerAlamat(grup: GrupAlamat[], batas: number = REKAP_MAKS): RekapAlamat {
  const semua = grup
    .map((g) => ({ alamat: g.alamat, jumlah: g._count._all }))
    .filter((g) => g.jumlah > 0)
    .sort((a, b) => b.jumlah - a.jumlah || a.alamat.localeCompare(b.alamat, "id"));
  const data = semua.slice(0, batas);
  const lainnya = semua.slice(batas).reduce((n, g) => n + g.jumlah, 0);
  const total = semua.reduce((n, g) => n + g.jumlah, 0);
  return { data, lainnya, total };
}

/** Satu baris hasil `groupBy({ by: ["tahun"], _count: { _all: true } })`. */
export type GrupTahun = { tahun: number; _count: { _all: number } };
/** Jumlah penerima pada satu tahun. */
export type JumlahTahun = { tahun: number; jumlah: number };

/** Daftar tahun yang punya penerima, terbaru dulu. */
export function jumlahPerTahun(grup: GrupTahun[]): JumlahTahun[] {
  return grup
    .map((g) => ({ tahun: g.tahun, jumlah: g._count._all }))
    .filter((g) => g.jumlah > 0)
    .sort((a, b) => b.tahun - a.tahun);
}
