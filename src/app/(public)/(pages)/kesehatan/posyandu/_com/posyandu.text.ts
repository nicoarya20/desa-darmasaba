/** Teks UI halaman Posyandu (daftar + detail). Tanpa em dash. */
export const POSYANDU_TEXT = {
  pageTitle: "Posyandu Desa Darmasaba",
  pageLead:
    "Jadwal dan kontak posyandu di tiap banjar, serta ringkasan kesehatan balita dan ibu hamil dalam angka gabungan.",
  tabsLabel: "Bagian halaman posyandu",
  tabRingkasan: "Ringkasan",
  tabPosyandu: "Data Posyandu",
  tabPosyanduShort: "Posyandu",
  tabBalita: "Balita",
  tabIbuHamil: "Ibu Hamil",

  privacyNote:
    "Semua angka adalah jumlah gabungan. Nama dan data pribadi balita maupun ibu hamil tidak ditampilkan.",
  retry: "Coba lagi",

  // Ringkasan
  ibuHamilLabel: "Ibu hamil aktif",
  balitaLabel: "Balita terdaftar",
  alertLabel: "Alert stunting",
  ibuHamilNote: "Sedang didampingi posyandu",
  balitaNote: "Tercatat di posyandu desa",
  alertNote: "Balita berstatus alert atau stunting",
  targetLabel: "Target stunting desa",
  imunisasiLabel: "Imunisasi lengkap",
  giziLabel: "Gizi baik",
  pemeriksaanLabel: "Pemeriksaan rutin",
  orangUnit: "orang",
  balitaUnit: "balita",
  pctNote: "Dari balita terdaftar",
  pctTooFew: "Belum cukup data",
  pctTooFewNote: "Persentase tampil bila ada sedikitnya 3 balita terdaftar.",
  pctNoData: "Belum ada data",
  pctNoDataNote: "Belum ada balita terdaftar.",
  statsLoading: "Memuat ringkasan kesehatan",
  statsFailed: "Ringkasan kesehatan gagal dimuat.",

  // Data posyandu
  directoryTitle: "Daftar posyandu",
  directoryLead: (n: number) => `${n} posyandu terdaftar di Desa Darmasaba.`,
  searchLabel: "Cari posyandu",
  searchPlaceholder: "Cari nama posyandu",
  directoryLoading: "Memuat daftar posyandu",
  directoryFailed: "Daftar posyandu gagal dimuat.",
  directoryEmpty: "Belum ada posyandu terdaftar.",
  directoryNoMatch: (q: string) => `Tidak ada posyandu yang cocok dengan “${q}”.`,
  jadwalKosong: "Jadwal belum diisi",
  nomorKosong: "Nomor belum diisi",
  banjarKosong: "Banjar belum diisi",
  telepon: (nomor: string) => `Telepon ${nomor}`,

  // Per banjar
  banjarLoading: "Memuat angka per banjar",
  banjarFailed: "Angka per banjar gagal dimuat.",
  banjarEmpty: "Belum ada banjar terdaftar.",
  rowFailed: "Gagal dimuat",
  desaRow: "Seluruh desa",
  colBanjar: "Banjar",
  unassignedNote:
    "Sebagian data belum terhubung ke banjar, jadi jumlah per banjar bisa lebih kecil dari angka seluruh desa.",
  balitaTitle: "Balita per banjar",
  balitaLead:
    "Jumlah balita yang terdaftar di posyandu tiap banjar beserta persentase imunisasi, gizi, dan pemeriksaan.",
  pctFewShort: "belum cukup data",
  pctNoneShort: "belum ada data",
  ibuHamilTitle: "Ibu hamil aktif per banjar",
  ibuHamilLead: "Jumlah ibu hamil yang sedang didampingi posyandu di tiap banjar.",

  // Detail
  detailLoading: "Memuat detail posyandu",
  detailNotFound: "Posyandu tidak ditemukan. Mungkin sudah dihapus atau tautannya salah.",
  detailFailed: "Detail posyandu gagal dimuat. Muat ulang halaman untuk mencoba lagi.",
  backToList: "Lihat semua posyandu",
  infoBanjar: "Banjar",
  infoJadwal: "Jadwal pelayanan",
  infoTelepon: "Telepon",
  callButton: "Telepon",
  fotoLabel: (name: string) => `Buka foto ${name} ukuran penuh`,
  tentang: "Tentang posyandu",
} as const;
