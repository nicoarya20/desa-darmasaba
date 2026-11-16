/** Label UI halaman Sektor Unggulan Desa. Tanpa em dash; pengantar tidak menyebut sektor tertentu (data dari CMS). */
export const SEKTOR_UNGGULAN_TEXT = {
  title: "Sektor Unggulan Desa",
  lead: "Sektor ekonomi andalan Desa Darmasaba, diurutkan menurut nilai yang dicatat pemerintah desa.",
  /** Wajib diisi KabarListHeader; kolom cari & pil tidak dirender (daftar pendek berperingkat). */
  searchLabel: "Cari sektor unggulan",
  searchPlaceholder: "Cari sektor unggulan",
  kategoriLabel: "Kategori sektor unggulan",
  rankingTitle: "Peringkat sektor",
  rankingCaption: (unit?: string) =>
    unit ? `Nilai dalam ${unit}, dari yang tertinggi.` : "Dari nilai tertinggi, sesuai catatan pemerintah desa.",
  rankingCaptionMixed: "Satuan tiap sektor berbeda, jadi angkanya tidak dibandingkan dengan batang.",
  periode: (periode: string) => `Periode ${periode}`,
  updated: (tanggal: string) => `Data diperbarui ${tanggal}`,
  notFilled: "Belum diisi",
  notFilledNote: (n: number) => `${n} sektor belum diisi nilainya dan ditaruh di akhir daftar.`,
  detailTitle: "Tentang tiap sektor",
  loading: "Memuat sektor unggulan",
  empty: "Peringkat sektor unggulan akan tampil di sini setelah pemerintah desa mengisinya.",
  error: "Data sektor unggulan gagal dimuat. Coba muat ulang halaman.",
  potensiTitle: "Potensi desa",
  potensiBody: "Foto dan cerita di balik sektor-sektor ini ada di halaman Potensi Desa.",
  potensiLink: "Lihat potensi desa",
} as const;
