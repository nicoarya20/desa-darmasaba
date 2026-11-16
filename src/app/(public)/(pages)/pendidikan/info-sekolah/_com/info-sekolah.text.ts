import { formatJumlah } from "./info-sekolah.logic";

/** Teks halaman publik Info Sekolah (ringkasan + daftar pengajar). */
export const INFO_SEKOLAH_TEXT = {
  pageTitle: "Info Sekolah",
  pageLead: "Lembaga pendidikan beserta jumlah siswa dan tenaga pengajarnya, dikelompokkan per jenjang.",

  lembagaLabel: "Lembaga pendidikan",
  lembagaUnit: "lembaga",
  sebaranLabel: "Sebaran lembaga per jenjang",
  siswaLabel: "Siswa terdaftar",
  siswaUnit: "siswa",
  siswaNote: "Siswa aktif di semua jenjang. Nama siswa tidak ditampilkan untuk melindungi data anak.",
  pengajarLabel: "Tenaga pengajar",
  pengajarUnit: "orang",
  pengajarNote: "Guru dan tenaga pengajar aktif di semua jenjang.",
  pengajarLink: "Lihat daftar pengajar",

  directoryTitle: "Sekolah per jenjang",
  directoryLead: (lembaga: number, jenjang: number) =>
    `${formatJumlah(lembaga)} lembaga pendidikan di ${formatJumlah(jenjang)} jenjang.`,
  groupMeta: (lembaga: number, siswa: number | null, pengajar: number | null) =>
    [
      `${formatJumlah(lembaga)} lembaga`,
      siswa !== null ? `${formatJumlah(siswa)} siswa` : null,
      pengajar !== null ? `${formatJumlah(pengajar)} pengajar` : null,
    ]
      .filter(Boolean)
      .join(" · "),

  loading: "Memuat info sekolah",
  failed: "Info sekolah belum bisa dimuat. Periksa koneksi lalu coba lagi.",
  emptyTitle: "Belum ada data sekolah",
  emptyBody: "Data lembaga pendidikan, siswa, dan tenaga pengajar akan tampil di sini setelah diisi oleh pemerintah desa.",
  retry: "Coba lagi",

  pengajarTitle: "Daftar Pengajar",
  pengajarLead: "Guru dan tenaga pengajar di lembaga pendidikan, per jenjang.",
  pengajarSearchLabel: "Cari pengajar",
  pengajarSearchPlaceholder: "Cari nama pengajar atau sekolah",
  jenjangFilterLabel: "Saring jenjang pendidikan",
  pengajarListLabel: "Daftar pengajar",
  pengajarLoading: "Memuat daftar pengajar",
  pengajarFailed: "Daftar pengajar belum bisa dimuat. Periksa koneksi lalu coba lagi.",
  pengajarCount: (n: number) => `${formatJumlah(n)} pengajar`,
  pageOutOfRange: (page: number) => `Halaman ${page} tidak ada. Kembali ke halaman pertama daftar.`,
  firstPage: "Ke halaman pertama",
  paginationLabel: "Halaman daftar pengajar",
  pengajarNoun: "pengajar",
} as const;
