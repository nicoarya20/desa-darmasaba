/** Teks halaman publik Data Pendidikan (penduduk menurut pendidikan terakhir). */
export const DATA_PENDIDIKAN_TEXT = {
  pageTitle: "Data Pendidikan",
  pageLead: "Jumlah penduduk Desa Darmasaba menurut pendidikan terakhir yang ditamatkan.",
  updated: (tanggal: string) => `Data diperbarui ${tanggal}`,
  panelTitle: "Penduduk menurut pendidikan terakhir",
  panelCaption: "Persen menunjukkan porsi tiap jenjang dari seluruh penduduk yang tercatat.",
  totalLabel: "Total tercatat",
  unit: "orang",
  notFilled: "Belum diisi",
  notFilledNote: (n: number) => `${n} jenjang belum diisi jumlahnya, jadi tidak ikut dihitung dalam total dan persen.`,
  emptyTitle: "Belum ada data pendidikan yang tercatat",
  emptyBody: "Jumlah penduduk menurut pendidikan terakhir akan tampil di sini setelah diisi oleh pemerintah desa.",
  failed: "Data pendidikan gagal dimuat. Periksa koneksi lalu coba lagi.",
  retry: "Coba lagi",
  loading: "Memuat data pendidikan",
} as const;
