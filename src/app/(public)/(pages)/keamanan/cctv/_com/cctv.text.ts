import type { CctvStatusKey } from "./cctv.meta";

/** Teks UI halaman CCTV Keamanan Desa (Bahasa Indonesia, tanpa em dash). */
export const CCTV_TEXT = {
  pageTitle: "CCTV Keamanan Desa",
  pageLead: "Titik CCTV yang terpasang di wilayah Desa Darmasaba untuk mendukung keamanan dan ketertiban lingkungan.",

  totalLabel: "Titik CCTV",
  totalUnit: "titik",
  allMapped: "Semua titik tampil di peta",
  partlyMapped: (mapped: number, missing: number) => `${mapped} tampil di peta, ${missing} belum punya koordinat`,
  noneMapped: "Koordinat titik belum diisi",
  unknownCount: (n: number) => `${n} titik statusnya belum diisi`,
  onlineLabel: "Online",
  offlineLabel: "Offline",
  unknownLabel: "Status belum diisi",
  cameraUnit: "kamera",
  statusNote: "Status online dan offline sesuai data terakhir yang tercatat di sistem desa.",

  panelTitle: "Peta titik CCTV",
  panelLead: "Pilih titik di peta atau di daftar untuk melihat lokasinya.",
  legendLabel: "Keterangan warna titik",
  mapLabel: "Peta titik CCTV Desa Darmasaba",
  mapLoading: "Memuat peta",
  mapEmpty: "Koordinat titik CCTV belum diisi, jadi peta belum bisa menampilkan lokasinya.",
  listLabel: "Daftar CCTV",
  searchLabel: "Cari CCTV",
  searchPlaceholder: "Cari kode, nama, atau lokasi",
  noMatch: (q: string) => `Tidak ada CCTV yang cocok dengan "${q}".`,
  showOnMap: "Tampilkan di peta: ",
  lokasiKosong: "Lokasi belum diisi",
  notOnMap: "Belum ada titik di peta",
  lastActive: "Aktif terakhir",
  lastActiveKosong: "Waktu aktif belum tercatat",
  justNow: "baru saja",

  emptyTitle: "Belum ada titik CCTV yang terdata",
  emptyBody: "Titik CCTV akan tampil di sini beserta lokasinya di peta setelah didata oleh desa.",
  failed: "Data CCTV gagal dimuat. Periksa koneksi lalu coba lagi.",
  retry: "Coba lagi",
  loading: "Memuat data CCTV",
} as const;

/** Label status (daftar, legenda, popup peta). */
export const STATUS_LABEL: Record<CctvStatusKey, string> = {
  online: CCTV_TEXT.onlineLabel,
  offline: CCTV_TEXT.offlineLabel,
  unknown: CCTV_TEXT.unknownLabel,
};
