import type { JenisDokumen } from "@/lib/dokumen-perencanaan";

/** Judul + pengantar tiap kategori; label tab memakai istilah desa (RKPDes), judul panel memakai nama lengkap. */
export type KategoriText = { tab: string; title: string; lead: string; empty: string };

/** Teks UI halaman publik Arah Kebijakan Pembangunan Desa. */
export const ARAH_TEXT = {
  pageTitle: "Arah Kebijakan Pembangunan Desa",
  pageLead: "Dokumen perencanaan dan penganggaran Desa Darmasaba: RPJM Desa, RKPDes, APBDes, dan pelaporan realisasinya.",
  tabsLabel: "Kategori dokumen",
  tableLabel: (kategori: string) => `Daftar dokumen ${kategori}`,
  loading: "Memuat dokumen",
  failed: "Dokumen belum dapat ditampilkan.",
  retry: "Coba lagi",
  pagination: "Halaman daftar dokumen",
  colNo: "No",
  colNama: "Nama Dokumen",
  colTahun: "Tahun",
  colFile: "File",
  colAksi: "Aksi",
  fileKosong: "Belum diunggah",
  aksiKosong: "Tidak ada berkas",
  lihat: "Lihat",
  unduh: "Unduh",
  lihatLabel: (judul: string) => `Lihat ${judul} (PDF, tab baru)`,
  unduhLabel: (judul: string) => `Unduh ${judul} (PDF)`,
  nomorPerdes: (v: string) => `Nomor Perdes: ${v}`,
} as const;

export const KATEGORI_TEXT: Record<JenisDokumen, KategoriText> = {
  RPJM: {
    tab: "RPJM Desa",
    title: "RPJM Desa",
    lead: "Rencana Pembangunan Jangka Menengah Desa untuk satu periode pemerintahan.",
    empty: "Belum ada dokumen RPJM Desa.",
  },
  RKP: {
    tab: "RKPDes",
    title: "RKP Desa (RKPDes)",
    lead: "Rencana Kerja Pemerintah Desa tahunan sebagai penjabaran RPJM Desa.",
    empty: "Belum ada dokumen RKP Desa.",
  },
  APBDES: {
    tab: "APBDes",
    title: "APBDes",
    lead: "Anggaran Pendapatan dan Belanja Desa untuk tiap tahun anggaran.",
    empty: "Belum ada dokumen APBDes.",
  },
  PELAPORAN_APBDES: {
    tab: "Pelaporan",
    title: "Pelaporan Realisasi APBDes",
    lead: "Laporan realisasi pelaksanaan APBDes.",
    empty: "Belum ada dokumen pelaporan realisasi APBDes.",
  },
  BERITA_ACARA_MUSYAWARAH: {
    tab: "Berita Acara",
    title: "Berita Acara Musyawarah",
    lead: "Berita acara musyawarah desa yang menjadi dasar perencanaan.",
    empty: "Belum ada berita acara musyawarah.",
  },
};
