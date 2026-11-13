import type { StrukturAdminText } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.config';

/** Teks halaman admin Struktur PPID (label umum form/tabel ada di `struktur-admin.text.ts`). */
export const STRUKTUR_PPID_ADMIN_TEXT = {
  title: 'Struktur PPID',
  tabs: { pegawai: 'Pegawai', jabatan: 'Jabatan', bagan: 'Bagan' },
  pegawai: {
    listTitle: 'Daftar Pegawai PPID',
    searchTitle: 'Pegawai PPID',
    searchPlaceholder: 'Cari nama atau jabatan…',
    createTitle: 'Tambah Pegawai PPID',
    editTitle: 'Edit Pegawai PPID',
    detailTitle: 'Detail Pegawai PPID',
    hapusKonfirmasi: 'Apakah Anda yakin ingin menghapus data pegawai PPID ini? Ia tidak tampil lagi di admin maupun bagan publik.',
    nonaktifKonfirmasi: 'Apakah Anda yakin ingin menonaktifkan pegawai PPID ini? Ia tidak tampil di bagan publik.',
    aktifKonfirmasi: 'Apakah Anda yakin ingin mengaktifkan kembali pegawai PPID ini?',
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
    title: 'Bagan Struktur PPID',
    label: 'Bagan struktur PPID',
  },
} as const satisfies StrukturAdminText;
