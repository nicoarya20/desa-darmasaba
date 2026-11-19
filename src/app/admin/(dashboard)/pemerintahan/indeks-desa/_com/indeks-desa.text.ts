import { CATATAN_IDM_MAX, SKOR_IDM_MAX, SKOR_IDM_MIN, TAHUN_IDM_MAX, TAHUN_IDM_MIN } from '@/lib/indeks-desa';

/** Teks admin Indeks Desa Membangun (daftar, form, konfirmasi hapus). */
export const INDEKS_DESA_ADMIN_TEXT = {
  title: 'Indeks Desa Membangun (IDM)',
  listTitle: 'Daftar Indeks Desa per Tahun',
  addNew: 'Tambah Baru',
  back: 'Kembali',
  empty: 'Belum ada data Indeks Desa. Isi dari dokumen IDM Kemendesa untuk Desa Darmasaba.',
  colTahun: 'Tahun',
  colIdm: 'Skor IDM',
  colStatus: 'Status',
  colAksi: 'Aksi',
  confirmDelete: 'Data Indeks Desa untuk tahun ini akan dihapus permanen. Lanjutkan?',
  formTahun: 'Tahun',
  formTahunHint: `Tahun data IDM, ${TAHUN_IDM_MIN} sampai ${TAHUN_IDM_MAX}. Satu tahun hanya boleh satu data.`,
  formSkorIdm: 'Skor IDM',
  formSkorDimensi: (singkatan: string, nama: string) => `Skor ${singkatan} (${nama})`,
  formSkorHint: `Angka ${SKOR_IDM_MIN} sampai ${SKOR_IDM_MAX}, persis seperti di dokumen Kemendesa (titik atau koma desimal).`,
  formStatus: 'Status IDM',
  formStatusHint: 'Pilih status seperti tertulis di dokumen Kemendesa. Status tidak dihitung otomatis dari skor.',
  formCatatan: 'Catatan',
  formCatatanHint: `Opsional, maksimal ${CATATAN_IDM_MAX} karakter, mis. sumber dokumen.`,
  submitCreate: 'Simpan',
  submitEdit: 'Simpan Perubahan',
  editLabel: (tahun: number) => `Edit data Indeks Desa ${tahun}`,
  deleteLabel: (tahun: number) => `Hapus data Indeks Desa ${tahun}`,
} as const;
