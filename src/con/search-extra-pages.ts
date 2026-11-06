import type { MenuItem } from '../../types/menu-item';

/**
 * Halaman publik yang TIDAK ada di navbar, tetapi tetap harus bisa ditemukan lewat
 * pencarian global (bagian "Halaman") dan tampil di halaman Peta Informasi. Dibaca lewat
 * `DEFAULT_SEARCH_MENUS` di `searchMenu`; navbar tetap membaca `navbar-list-menu.ts` saja. Bentuknya sama dengan config navbar:
 * grup = nama "menu utama" yang tampil sebagai keterangan, children = halaman.
 * id berawalan "x" agar tidak bentrok dengan id navbar.
 * Jangan masukkan halaman create, detail, hasil form (berhasil/gagal), atau daftar "semua-*".
 */
const searchExtraPages: MenuItem[] = [
  {
    id: 'x1',
    name: 'Transparansi',
    children: [
      { id: 'x1.1', name: 'APBDes', href: '/darmasaba/apbdes' },
      { id: 'x1.2', name: 'Desa Anti Korupsi', href: '/darmasaba/desa-anti-korupsi' },
      { id: 'x1.3', name: 'SDGs Desa', href: '/darmasaba/sdgs-desa' },
    ],
  },
  {
    id: 'x2',
    name: 'Desa',
    children: [
      { id: 'x2.1', name: 'Struktur Perangkat Desa', href: '/darmasaba/desa/profil/struktur-perangkat-desa' },
      { id: 'x2.2', name: 'Galeri Video', href: '/darmasaba/desa/galery/video' },
    ],
  },
  {
    id: 'x3',
    name: 'Layanan Online Desa',
    children: [
      {
        id: 'x3.1',
        name: 'Administrasi Online (Ajukan Surat)',
        href: '/darmasaba/inovasi/layanan-online-desa/administrasi-online',
      },
      {
        id: 'x3.2',
        name: 'Pengaduan Masyarakat',
        href: '/darmasaba/inovasi/layanan-online-desa/pengaduan-masyarakat',
      },
      { id: 'x3.3', name: 'Informasi Desa', href: '/darmasaba/inovasi/layanan-online-desa/informasi-desa' },
    ],
  },
  {
    id: 'x4',
    name: 'Kesehatan',
    children: [
      {
        id: 'x4.1',
        name: 'Fasilitas Kesehatan',
        href: '/darmasaba/kesehatan/data-kesehatan-warga/fasilitas-kesehatan-page',
      },
      {
        id: 'x4.2',
        name: 'Artikel Kesehatan',
        href: '/darmasaba/kesehatan/data-kesehatan-warga/artikel-kesehatan-page',
      },
      {
        id: 'x4.3',
        name: 'Jadwal Kegiatan Kesehatan',
        href: '/darmasaba/kesehatan/data-kesehatan-warga/jadwal-kegiatan-page',
      },
      { id: 'x4.4', name: 'Grafik Penyakit', href: '/darmasaba/kesehatan/data-kesehatan-warga/grafik-penyakit' },
    ],
  },
  {
    id: 'x5',
    name: 'Informasi',
    children: [{ id: 'x5.1', name: 'Peta Informasi (Semua Halaman)', href: '/darmasaba/peta-informasi' }],
  },
];

export default searchExtraPages;
