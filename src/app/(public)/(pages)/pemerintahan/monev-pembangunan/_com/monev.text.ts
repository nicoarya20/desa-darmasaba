import { JENIS_DOKUMEN_LABEL, type JenisDokumen } from "@/lib/dokumen-perencanaan";

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

  docTitle: "Dokumen Perencanaan",
  docLead: "RPJM Desa, RKP Desa, dan berita acara musyawarah sebagai dasar kegiatan pembangunan.",
  docTabsLabel: "Jenis dokumen perencanaan",
  docTabShort: { BERITA_ACARA_MUSYAWARAH: "Berita Acara" } as Partial<Record<JenisDokumen, string>>,
  docEmpty: (jenis: JenisDokumen) =>
    `Belum ada dokumen ${JENIS_DOKUMEN_LABEL[jenis]}. Dokumen akan tampil setelah ditambahkan oleh admin desa.`,
  docFailed: "Dokumen perencanaan belum dapat ditampilkan.",
  docLoading: "Memuat dokumen perencanaan",
  docNomorPerdes: (v: string) => `Nomor Perdes: ${v}`,
  docView: "Lihat PDF",
  docDownload: "Unduh",
  docNoFile: "Berkas PDF belum tersedia.",
  docPagination: "Halaman dokumen perencanaan",
} as const;
