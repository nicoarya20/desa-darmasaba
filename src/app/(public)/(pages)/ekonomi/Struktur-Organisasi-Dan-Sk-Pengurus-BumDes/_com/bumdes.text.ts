/** Teks UI halaman BUMDes dan profil pengurusnya. Tanpa em dash. */
export const BUMDES_TEXT = {
  title: 'BUMDes',
  lead: 'Profil, unit usaha, dan susunan pengurus Badan Usaha Milik Desa Darmasaba.',
  /** Wajib diisi KabarListHeader; kolom cari & pil kategori tidak dirender. */
  searchLabel: 'Cari di halaman BUMDes',
  searchPlaceholder: 'Cari',
  kategoriLabel: 'Kategori BUMDes',

  profil: {
    label: 'Profil BUMDes',
    loading: 'Memuat profil BUMDes',
    empty: 'Profil BUMDes akan tampil di sini.',
    error: 'Profil BUMDes gagal dimuat. Coba muat ulang halaman.',
    logoAlt: (nama: string) => `Logo ${nama}`,
    berdiri: 'Berdiri',
    berdiriValue: (tahun: number) => `Tahun ${tahun}`,
    alamat: 'Alamat',
    kontak: 'Kontak',
  },

  galeri: {
    title: 'Galeri Foto',
    label: 'Galeri foto BUMDes',
    fotoAlt: (nama: string, nomor: number) => `Foto ${nama} ${nomor}`,
    lihat: (alt: string) => `Lihat ${alt}`,
    tutup: 'Tutup foto',
  },

  unitUsaha: {
    title: 'Unit Usaha',
    listLabel: 'Daftar unit usaha BUMDes',
    loading: 'Memuat unit usaha BUMDes',
    empty: 'Unit usaha BUMDes akan tampil di sini.',
    error: 'Unit usaha BUMDes gagal dimuat. Coba muat ulang halaman.',
  },

  pengurus: {
    title: 'Struktur Pengurus',
    chartLabel: 'Bagan struktur pengurus BUMDes',
    empty: 'Struktur pengurus BUMDes akan tampil di sini.',
    error: 'Struktur pengurus BUMDes gagal dimuat.',
    reload: 'Muat ulang',
  },

  dokumen: {
    title: 'SK & Dokumen',
    listLabel: 'Dokumen BUMDes',
    unduh: 'Unduh',
    unduhLabel: (judul: string) => `Unduh ${judul} (tab baru)`,
  },
} as const;

/** Teks halaman profil pengurus `/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/[id]`. */
export const PENGURUS_DETAIL_TEXT = {
  kembali: 'BUMDes',
  kategori: 'Pengurus BUMDes',
  loading: 'Memuat profil pengurus BUMDes',
  fotoAlt: (nama: string) => `Foto ${nama}`,
  notFound: 'Profil pengurus BUMDes tidak ditemukan atau sudah tidak ditampilkan.',
  error: 'Profil pengurus BUMDes gagal dimuat. Coba muat ulang halaman.',
  backToList: 'Lihat struktur pengurus BUMDes',
} as const;
