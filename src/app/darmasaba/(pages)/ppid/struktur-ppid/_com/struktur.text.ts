/** Teks halaman Struktur Organisasi PPID. */
export const STRUKTUR_TEXT = {
  title: 'Struktur Organisasi PPID',
  lead: 'Susunan pejabat dan pegawai yang bertugas dalam Pejabat Pengelola Informasi dan Dokumentasi (PPID) Desa Darmasaba. Pilih kartu untuk melihat profil lengkap.',
  searchLabel: 'Cari nama atau jabatan',
  searchPlaceholder: 'Cari nama atau jabatan…',
  chartLabel: 'Bagan struktur organisasi PPID',
  vacant: 'Belum ditugaskan',
  detailSuffix: 'lihat profil',
  loading: 'Memuat struktur organisasi…',
  empty: 'Data pegawai belum tersedia.',
  emptyHint: 'Belum ada pegawai aktif yang tercatat untuk PPID.',
  reload: 'Muat Ulang',
  noMatch: (query: string) => `Tidak ada nama atau jabatan yang cocok dengan “${query}”.`,
} as const;
