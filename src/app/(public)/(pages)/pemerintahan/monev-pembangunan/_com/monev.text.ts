/** Label UI halaman publik Monev & Pembangunan. */
export const MONEV_TEXT = {
  pageTitle: "Monev & Pembangunan",
  pageLead: "Pantau progres kegiatan pembangunan Desa Darmasaba beserta anggarannya.",
  loading: "Memuat ringkasan monev",

  emptyTitle: "Belum ada kegiatan pembangunan yang dipantau",
  emptyBody: "Ringkasan progres dan anggaran akan tampil setelah admin desa mengisi data kegiatan pembangunan.",
  failedSummary: "Data monev belum dapat ditampilkan.",
  retry: "Coba lagi",

  kegiatanLabel: "Kegiatan pembangunan",
  kegiatanUnit: "kegiatan",
  statusBarLabel: "Sebaran kegiatan per status",
  belumDiisi: "Status belum diisi",
  anggaranLabel: "Total anggaran",
  anggaranNote: "Jumlah anggaran seluruh kegiatan pembangunan",
  anggaranKosong: "Belum tercatat",
  progresLabel: "Rata-rata progres",
  progresNote: "Dari kegiatan yang sudah melaporkan progres",

  apbdesTitle: "Realisasi anggaran desa",
  apbdesBody: "Lihat realisasi anggaran desa secara lengkap di halaman APBDes.",
  apbdesCta: "Buka Realisasi APBDes",

  listTitle: "Daftar kegiatan",
  listLead: "Status, progres, dan anggaran tiap kegiatan pembangunan.",
  filterLabel: "Saring kegiatan menurut status",
  filterAll: "Semua",
  colKegiatan: "Kegiatan",
  colProgres: "Progres",
  colAnggaran: "Anggaran",
  progresBelumDiisi: "Progres belum diisi",
  anggaranBelumDiisi: "Belum diisi",
  sumberDana: (v: string) => `Sumber dana: ${v}`,
  progresAria: (judul: string) => `Progres ${judul}`,
  listEmptyFiltered: "Tidak ada kegiatan pembangunan dengan status ini.",
  listFailed: "Daftar kegiatan belum dapat ditampilkan.",
  pagination: "Halaman daftar kegiatan",

  arahTitle: "Dokumen perencanaan dan penganggaran",
  arahBody: "RPJM, RKP, APBDes, dan pelaporan realisasinya ada di Arah Kebijakan Pembangunan Desa.",
  arahCta: "Buka Arah Kebijakan Pembangunan Desa",
} as const;
