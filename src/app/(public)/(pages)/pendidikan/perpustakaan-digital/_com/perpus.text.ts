/** Teks halaman penghubung Perpustakaan Digital (`/pendidikan/perpustakaan-digital`). */
export const PERPUS_TEXT = {
  title: 'Perpustakaan Digital',
  /** Pengantar cadangan; bila pengaturan terisi, deskripsi dari admin dipakai sebagai gantinya. */
  lead: 'Koleksi ebook Desa Darmasaba dikelola di website perpustakaan desa. Baca kapan saja dan di mana saja.',
  cta: 'Kunjungi Website Perpustakaan',
  /** Tambahan untuk pembaca layar; label visual tombol tidak berubah. */
  newTabSr: ' (membuka tab baru)',
  caraLink: 'Cara membaca',
  opensNewTab: (host: string) => `Membuka ${host} di tab baru.`,

  loading: 'Memuat informasi perpustakaan',
  error: 'Informasi perpustakaan gagal dimuat. Coba muat ulang halaman.',
  empty: 'Tautan website perpustakaan belum tersedia.',

  fiturTitle: 'Yang tersedia di perpustakaan',
  fiturLead: 'Ebook bisa dibaca langsung secara daring di website perpustakaan desa.',
  fitur: [
    { title: 'Baca kapan saja', desc: 'Koleksi ebook bisa dibuka 24 jam dari ponsel maupun komputer.' },
    { title: 'Cari dengan cepat', desc: 'Temukan buku lewat judul, penulis, atau ISBN.' },
    { title: 'Simpan dan beri ulasan', desc: 'Tandai buku favorit dan beri penilaian setelah membaca.' },
  ],

  langkahTitle: 'Cara membaca',
  langkah: [
    { title: 'Buka website perpustakaan', desc: 'Website perpustakaan desa terbuka di tab baru, halaman ini tetap di tab sebelumnya.' },
    { title: 'Masuk ke akun', desc: 'Buku hanya bisa dibaca setelah masuk (login) di website perpustakaan.' },
    { title: 'Pilih dan baca', desc: 'Cari judul di menu Koleksi Buku, lalu mulai membaca.' },
  ],

  penutupTitle: 'Siap membaca?',
  penutupText: 'Buka website perpustakaan desa dan pilih buku yang ingin dibaca.',
} as const;
