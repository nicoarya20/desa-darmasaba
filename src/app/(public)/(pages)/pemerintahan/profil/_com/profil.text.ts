/** Teks halaman Profil Desa (`/pemerintahan/profil`). Isi section (sejarah, visi, dst.) datang dari CMS. */
export const PROFIL_TEXT = {
  title: 'Profil Desa',
  lead: 'Sejarah, visi dan misi, lambang, maskot, serta pemerintahan Desa Darmasaba dari masa ke masa.',
  logoAlt: 'Lambang Desa Darmasaba',
  sejarah: { title: 'Sejarah Desa', loading: 'Memuat sejarah desa…', empty: 'Sejarah desa belum tersedia.' },
  visiMisi: {
    title: 'Visi dan Misi Desa',
    visi: 'Visi Desa',
    misi: 'Misi Desa',
    loading: 'Memuat visi dan misi…',
    empty: 'Visi dan misi desa belum tersedia.',
  },
  wilayah: {
    title: 'Letak & Batas Wilayah',
    loading: 'Memuat batas wilayah…',
    empty: 'Data batas wilayah belum tersedia.',
    error: 'Data batas wilayah belum dapat dimuat. Silakan coba lagi nanti.',
    luas: 'Luas wilayah',
    side: (arah: string) => `Sebelah ${arah}`,
    mapTitle: 'Peta wilayah Desa Darmasaba',
    officeMapTitle: 'Peta lokasi Kantor Perbekel Darmasaba',
    officeCaption: 'Lokasi Kantor Perbekel Darmasaba',
  },
  lambang: { title: 'Lambang Desa', loading: 'Memuat lambang desa…', empty: 'Keterangan lambang desa belum tersedia.' },
  maskot: {
    title: 'Maskot Desa',
    iconAlt: 'Lambang maskot Sekar Pudak',
    loading: 'Memuat maskot desa…',
    empty: 'Keterangan maskot desa belum tersedia.',
    noImages: 'Belum ada gambar maskot yang ditambahkan.',
  },
  perbekel: {
    title: 'Profil Perbekel',
    loading: 'Memuat profil perbekel…',
    empty: 'Profil perbekel belum tersedia.',
    photoAlt: (name: string) => `Foto ${name}`,
    biodata: 'Biodata',
    pengalaman: 'Pengalaman',
    organisasi: 'Pengalaman Organisasi',
    program: 'Program Kerja Unggulan',
  },
  moto: {
    title: 'Moto Desa Darmasaba',
    values: [
      { letter: 'S', title: 'Santun', description: 'Pelayanan ramah, penuh empati, sopan, dan beretika.' },
      { letter: 'I', title: 'Inovatif', description: 'Berani menciptakan pembaruan dan ide-ide kreatif.' },
      { letter: 'G', title: 'Gesit', description: 'Cekatan, sigap, dan penuh inisiatif dalam bekerja.' },
      { letter: 'A', title: 'Adaptif', description: 'Cepat menyesuaikan diri terhadap perubahan dan selalu proaktif.' },
      { letter: 'P', title: 'Profesional', description: 'Berpengetahuan luas, terampil, dan bertanggung jawab.' },
    ],
    quoteBefore: 'Berkomitmen menghadirkan pelayanan terbaik dengan semangat ',
    quoteMark: 'SIGAP',
    quoteAfter: ' untuk masyarakat Desa Darmasaba.',
  },
  riwayat: {
    title: 'Perbekel dari Masa ke Masa',
    loading: 'Memuat daftar perbekel…',
    empty: 'Data perbekel dari masa ke masa belum tersedia.',
  },
} as const;

/** Teks Struktur Perangkat Desa (section di Profil Desa + halaman `/profil/struktur-perangkat-desa`). */
export const STRUKTUR_PERANGKAT_TEXT = {
  title: 'Struktur Perangkat Desa',
  lead: 'Susunan perangkat Desa Darmasaba beserta pegawai yang bertugas. Pilih kartu untuk melihat profil lengkap.',
  chartLabel: 'Bagan struktur perangkat desa',
  emptyHint: 'Belum ada perangkat desa aktif yang tercatat.',
  detail: { infoTitle: 'Informasi Pegawai', notFound: 'Profil perangkat desa tidak ditemukan.' },
} as const;
