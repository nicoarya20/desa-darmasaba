import {
  JENIS_DOKUMEN,
  JENIS_DOKUMEN_LABEL,
  JENIS_MUSYAWARAH,
  JENIS_MUSYAWARAH_LABEL,
  type JenisDokumen,
} from '@/lib/dokumen-perencanaan';

/** Teks admin halaman Arah Kebijakan Pembangunan Desa (nama menu di sidebar diatur terpisah di nav admin). */
export const DOKUMEN_ADMIN_TEXT = {
  pageTitle: 'Arah Kebijakan Pembangunan Desa',
  searchPlaceholder: 'Cari judul atau nomor Perdes...',
  listTitle: 'Daftar Dokumen',
  emptyAll: 'Belum ada dokumen.',
  emptyJenis: 'Belum ada dokumen untuk jenis ini.',
  createTitle: 'Tambah Dokumen Arah Kebijakan Pembangunan Desa',
  editTitle: 'Ubah Dokumen Arah Kebijakan Pembangunan Desa',
  filterAll: 'Semua',
  ringkasanDefault: 'Opsional',
  berkasHint: 'Berkas PDF (Opsional)',
} as const;

/** Contoh judul per jenis (placeholder) supaya admin tahu pola penamaan yang dipakai di halaman publik. */
export const JUDUL_PLACEHOLDER: Record<JenisDokumen, string> = {
  RPJM: 'RPJM Desa Darmasaba 2021-2027',
  RKP: 'RKP Desa Darmasaba 2026',
  APBDES: 'APBDes Desa Darmasaba Tahun 2026',
  PELAPORAN_APBDES: 'Laporan Realisasi APBDes Semester I 2026',
  BERITA_ACARA_MUSYAWARAH: 'Berita Acara Musrenbang Desa 2026',
};

/** Keterangan field Ringkasan per jenis; pelaporan memakainya untuk menulis periode laporan (tanpa kolom baru). */
export const RINGKASAN_HINT: Partial<Record<JenisDokumen, string>> = {
  PELAPORAN_APBDES: 'Opsional. Tulis periode laporan, misalnya Semester I (Januari-Juni).',
};

/** Keterangan field Tahun untuk jenis anggaran. */
export const TAHUN_HINT: Partial<Record<JenisDokumen, string>> = {
  APBDES: 'Tahun anggaran',
  PELAPORAN_APBDES: 'Tahun anggaran yang dilaporkan',
};

/** Opsi dropdown jenis dokumen (lima jenis, urutan mengikuti JENIS_DOKUMEN). */
export const JENIS_OPTIONS = JENIS_DOKUMEN.map((v) => ({ value: v, label: JENIS_DOKUMEN_LABEL[v] }));

/** Opsi dropdown jenis musyawarah (hanya untuk berita acara). */
export const MUSYAWARAH_OPTIONS = JENIS_MUSYAWARAH.map((v) => ({ value: v, label: JENIS_MUSYAWARAH_LABEL[v] }));
