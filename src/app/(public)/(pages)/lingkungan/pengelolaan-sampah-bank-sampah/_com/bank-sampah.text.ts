/** Label UI halaman Pengelolaan Sampah (Bank Sampah). */
export const BANK_SAMPAH_TEXT = {
  title: "Pengelolaan Sampah (Bank Sampah)",
  lead: "Bank Sampah Desa Darmasaba membantu warga mengurangi limbah sekaligus mendapat manfaat ekonomi dari sampah yang dipilah.",
  /** Wajib diisi KabarListHeader; kolom cari kepala tidak dirender (cari ada di bagian Lokasi). */
  searchLabel: "Cari lokasi Bank Sampah",
  searchPlaceholder: "Cari nama atau alamat",
  kategoriLabel: "Kategori",

  stepsTitle: "Cara menabung di Bank Sampah",
  stepsLoading: "Memuat langkah menabung",
  stepsEmpty: "Langkah menabung belum tersedia.",
  stepsError: "Langkah menabung gagal dimuat. Coba muat ulang halaman.",

  lokasiTitle: "Lokasi Bank Sampah",
  lokasiLead: "Pilih lokasi untuk melihat titiknya di peta.",
  lokasiLoading: "Memuat lokasi Bank Sampah",
  lokasiEmpty: "Lokasi Bank Sampah belum tersedia.",
  lokasiError: "Lokasi Bank Sampah gagal dimuat. Coba muat ulang halaman.",
  lokasiNoMatch: (query: string) => `Tidak ada lokasi yang cocok dengan “${query}”.`,
  listLabel: "Daftar lokasi Bank Sampah",
  mapLabel: "Peta lokasi Bank Sampah",
  mapLoading: "Memuat peta",
  showOnMap: "Tampilkan di peta:",
  notOnMap: "Belum ada titik di peta",
  petunjukArah: "Petunjuk arah",
  petunjukArahLabel: (name: string) => `Petunjuk arah ke ${name} (tab baru)`,
  detail: "Lihat detail",
  detailLabel: (name: string) => `Lihat detail ${name}: profil, struktur, dan dokumentasi`,
} as const;
