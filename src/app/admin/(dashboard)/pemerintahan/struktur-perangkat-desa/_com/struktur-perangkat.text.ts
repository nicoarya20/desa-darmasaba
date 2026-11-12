/** Teks halaman admin Struktur Perangkat Desa (label umum form/tabel ada di `struktur-admin.text.ts`). */
export const STRUKTUR_PERANGKAT_ADMIN_TEXT = {
  title: 'Struktur Perangkat Desa',
  tabs: { pegawai: 'Pegawai', jabatan: 'Jabatan', bagan: 'Bagan' },
  pegawai: {
    listTitle: 'Daftar Perangkat Desa',
    searchTitle: 'Perangkat Desa',
    searchPlaceholder: 'Cari nama atau jabatan…',
    createTitle: 'Tambah Perangkat Desa',
    editTitle: 'Edit Perangkat Desa',
    detailTitle: 'Detail Perangkat Desa',
    hapusKonfirmasi: 'Apakah Anda yakin ingin menghapus data perangkat desa ini? Foto ikut terhapus.',
    nonaktifKonfirmasi: 'Apakah Anda yakin ingin menonaktifkan perangkat desa ini? Ia tidak tampil di bagan publik.',
    aktifKonfirmasi: 'Apakah Anda yakin ingin mengaktifkan kembali perangkat desa ini?',
    nonaktifTitle: 'Konfirmasi Nonaktifkan',
    aktifTitle: 'Konfirmasi Aktifkan',
  },
  jabatan: {
    listTitle: 'Daftar Jabatan',
    createTitle: 'Tambah Jabatan',
    editTitle: 'Edit Jabatan',
    hapusKonfirmasi: (nama: string) => `Apakah Anda yakin ingin menghapus jabatan "${nama}"?`,
  },
  bagan: {
    title: 'Bagan Struktur Perangkat Desa',
    label: 'Bagan struktur perangkat desa',
  },
} as const;
