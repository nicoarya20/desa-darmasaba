/** Teks bersama bagan struktur organisasi (PPID & Perangkat Desa). Teks per halaman ada di folder halamannya. */
export const STRUKTUR_TEXT = {
  searchLabel: 'Cari nama atau jabatan',
  searchPlaceholder: 'Cari nama atau jabatan…',
  vacant: 'Belum ditugaskan',
  detailSuffix: 'lihat profil',
  loading: 'Memuat struktur organisasi…',
  /** Judul utama saat belum ada pegawai aktif (PPID & Perangkat Desa); kalimat kedua = `emptyHint` halaman. */
  empty: 'Data sedang disiapkan',
  reload: 'Muat Ulang',
  noMatch: (query: string) => `Tidak ada nama atau jabatan yang cocok dengan “${query}”.`,
} as const;

/** Teks halaman profil pegawai dari bagan (label baris & keadaan). Judul blok info + pesan per halaman via props. */
export const STRUKTUR_DETAIL_TEXT = {
  loading: 'Memuat profil pegawai…',
  error: 'Profil pegawai belum dapat dimuat. Silakan coba lagi nanti.',
  photoAlt: (name: string) => `Foto ${name}`,
  email: 'Email',
  telepon: 'Telepon',
  status: 'Status',
  aktif: 'Aktif',
  tidakAktif: 'Tidak Aktif',
} as const;
