/** Teks UI halaman detail lowongan kerja publik (tanpa em dash). Gaji & pil berbagi teks dengan kartu daftar. */
export const LOWONGAN_DETAIL_TEXT = {
  memuat: 'Memuat lowongan',
  infoLabel: 'Ringkasan lowongan',
  tayangLabel: 'Tanggal tayang',
  deskripsi: 'Deskripsi pekerjaan',
  kualifikasi: 'Kualifikasi',
  tempatKerja: 'Tempat kerja',
  bukaPeta: 'Buka di Google Maps',
  tabBaru: '(membuka tab baru)',
  whatsapp: 'WhatsApp',
  telepon: 'Telepon',
  kontakLabel: 'Hubungi pemberi kerja',
  kontakKosong: 'Kontak belum dicantumkan',
  penutupJudul: 'Tertarik dengan lowongan ini?',
  /** `wa` = nomor seluler (WhatsApp + telepon); selain itu hanya telepon. */
  penutupAjak: (pemberiKerja: string, wa: boolean) =>
    `Hubungi ${pemberiKerja || 'pemberi kerja'} langsung lewat ${wa ? 'WhatsApp atau telepon' : 'telepon'}.`,
  penutupCatatan: 'Website desa hanya menampilkan lowongan. Lamaran dan wawancara diatur langsung dengan pemberi kerja.',
  notFoundTitle: 'Lowongan tidak ditemukan',
  notFoundDesc: 'Lowongan ini sudah ditutup, tidak ditampilkan lagi, atau alamatnya salah.',
  errorTitle: 'Lowongan gagal dimuat',
  errorDesc: 'Periksa koneksi internet lalu coba lagi.',
  retry: 'Coba lagi',
  lihatSemua: 'Lihat semua lowongan',
} as const;
