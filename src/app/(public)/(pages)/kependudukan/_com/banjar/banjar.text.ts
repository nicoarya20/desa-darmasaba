import { MISKIN_KETERANGAN, MISKIN_LABEL } from "@/lib/data-banjar";

/** Label UI section Penduduk per Banjar (Dashboard Kependudukan). */
export const BANJAR_TEXT = {
  /** Anchor section; navbar & redirect rute lama `/kependudukan/data-per-banjar` menuju `#banjar`. */
  anchor: "banjar",
  title: "Penduduk per banjar",
  caption: (tahun: number, banjar: number) => `Data ${tahun} · ${banjar} banjar, terbanyak di atas`,
  updated: (tanggal: string) => `Data diperbarui ${tanggal}`,
  totalLabel: "Total penduduk",
  unit: "jiwa",
  kk: "KK",
  miskin: MISKIN_LABEL.toLowerCase(),
  totalKk: (kk: string) => `${kk} kepala keluarga`,
  miskinBelumDiisi: `Jumlah ${MISKIN_LABEL.toLowerCase()} per banjar belum diisi.`,
  miskinNote: `${MISKIN_LABEL}: ${MISKIN_KETERANGAN}.`,
  pendudukBelumDiisi: (n: number) => `${n} banjar belum diisi jumlah penduduknya.`,
  loading: "Memuat data penduduk per banjar",
  empty: "Data penduduk per banjar akan tampil di sini setelah diisi pemerintah desa.",
  error: "Data penduduk per banjar gagal dimuat.",
} as const;
