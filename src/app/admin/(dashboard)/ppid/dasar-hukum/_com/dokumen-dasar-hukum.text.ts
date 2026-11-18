/** Teks pengelola Dokumen Dasar Hukum (admin PPID). */
export const DOKUMEN_ADMIN_TEXT = {
  title: 'Dokumen Dasar Hukum',
  note: 'Perubahan di bagian ini langsung tersimpan; tidak ikut tombol Simpan di atas.',
  uploadLabel: 'Tambah dokumen (PDF)',
  uploadDescription: 'Pilih satu atau beberapa PDF. Judul awal diambil dari nama berkas dan boleh diedit sebelum disimpan.',
  simpan: 'Simpan dokumen',
  empty: 'Belum ada dokumen dasar hukum.',
  lihat: 'Lihat',
  simpanJudul: 'Simpan judul',
  naik: 'Naikkan',
  turun: 'Turunkan',
  hapus: 'Hapus',
  konfirmasiHapus: (judul: string) => `Hapus dokumen "${judul}"? Berkas PDF-nya ikut dihapus permanen.`,
} as const;
