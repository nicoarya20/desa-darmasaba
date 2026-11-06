import type { Tipe } from "./apbdes.logic";

/** Label UI section APBDes di beranda. */
export const APBDES_TEXT = {
  title: "APBDes",
  lead: "Transparansi APBDes Darmasaba adalah langkah nyata menuju tata kelola desa yang bersih, terbuka, dan bertanggung jawab.",
  yearLabel: "Pilih tahun APBDes",
  singleYear: (tahun: number) => `Tahun ${tahun}`,
  tipe: { pendapatan: "Pendapatan", belanja: "Belanja", pembiayaan: "Pembiayaan" } satisfies Record<Tipe, string>,
  pagu: "Pagu",
  realisasi: "Realisasi",
  noRealisasi: "Belum ada realisasi",
  progressLabel: (tipe: string) => `Realisasi ${tipe}`,
  chartTitle: "Pagu dan realisasi",
  chartNoRealisasi: (tahun: number) => `Realisasi tahun ${tahun} belum tercatat.`,
  detailTitle: "Rincian anggaran",
  posCount: (n: number) => `${n} pos`,
  emptyAll: "Data APBDes belum tersedia.",
  emptyYear: (tahun: number) => `Belum ada rincian anggaran untuk tahun ${tahun}.`,
  loading: "Memuat data APBDes",
  cta: "Lihat semua data APBDes",
} as const;
