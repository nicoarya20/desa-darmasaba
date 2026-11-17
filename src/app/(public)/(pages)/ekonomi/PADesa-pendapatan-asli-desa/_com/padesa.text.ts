import { formatRupiahCompact } from "@/app/(public)/_com/main-page/apbdes/apbdes.logic";

/** Selisih pagu terhadap tahun pembanding, netral (tanpa warna baik/buruk). */
function deltaText(selisih: number, tahun: number): string {
  if (selisih === 0) return `Sama dengan tahun ${tahun}`;
  const arah = selisih > 0 ? "Naik" : "Turun";
  return `${arah} ${formatRupiahCompact(Math.abs(selisih))} dari tahun ${tahun}`;
}

/** Label UI halaman Pendapatan Asli Desa (`/ekonomi/PADesa-pendapatan-asli-desa`). */
export const PADESA_TEXT = {
  title: "Pendapatan Asli Desa",
  lead: "Pendapatan yang digali Desa Darmasaba sendiri dari hasil usaha, hasil aset, serta swadaya dan partisipasi warga, bagian dari APBDes desa.",
  /** Wajib diisi KabarListHeader walau kolom cari & pil tidak dirender. */
  searchLabel: "Cari pendapatan asli desa",
  kategoriLabel: "Kategori pendapatan asli desa",
  year: (tahun: number) => `APBDes Tahun ${tahun}`,
  updatedAt: (tanggal: string) => `Data diperbarui ${tanggal}`,
  summaryLabel: "Ringkasan Pendapatan Asli Desa",
  cardPagu: "Anggaran Pendapatan Asli Desa",
  cardPorsi: "Porsi dari Pendapatan Desa",
  porsiNote: (total: string) => `dari total Pendapatan Desa ${total}`,
  delta: deltaText,
  detailTitle: "Rincian sumber pendapatan",
  loading: "Memuat Pendapatan Asli Desa",
  emptyNoApbdes: "Pendapatan Asli Desa akan tampil di sini setelah APBDes desa diterbitkan.",
  emptyNoPades: "Rincian hasil usaha, hasil aset, serta swadaya dan partisipasi warga akan tampil di sini setelah tercatat di APBDes.",
  error: "Data Pendapatan Asli Desa gagal dimuat. Coba muat ulang halaman.",
  cta: "Lihat APBDes lengkap",
} as const;
