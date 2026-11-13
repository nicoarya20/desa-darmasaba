import type { StrukturAdminText } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.config';

/** Teks halaman admin Struktur BUMDes (label umum form/tabel ada di `struktur-admin.text.ts`). */
export const STRUKTUR_BUMDES_ADMIN_TEXT = {
  title: 'BUMDes',
  tabs: { pegawai: 'Pegawai', jabatan: 'Jabatan', bagan: 'Bagan' },
  pegawai: {
    listTitle: 'Daftar Pegawai BUMDes',
    searchTitle: 'Pegawai BUMDes',
    searchPlaceholder: 'Cari nama atau jabatan…',
    createTitle: 'Tambah Pegawai BUMDes',
    editTitle: 'Edit Pegawai BUMDes',
    detailTitle: 'Detail Pegawai BUMDes',
    hapusKonfirmasi: 'Apakah Anda yakin ingin menghapus data pegawai BUMDes ini? Foto ikut terhapus.',
    nonaktifKonfirmasi: 'Apakah Anda yakin ingin menonaktifkan pegawai BUMDes ini? Ia tidak tampil di bagan publik.',
    aktifKonfirmasi: 'Apakah Anda yakin ingin mengaktifkan kembali pegawai BUMDes ini?',
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
    title: 'Bagan Struktur BUMDes',
    label: 'Bagan struktur BUMDes',
  },
} as const satisfies StrukturAdminText;
