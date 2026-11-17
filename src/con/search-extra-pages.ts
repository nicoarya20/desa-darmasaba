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
      { id: 'x1.1', name: 'APBDes', href: '/apbdes' },
      { id: 'x1.3', name: 'SDGs Desa', href: '/sdgs-desa' },
    ],
  },
  {
    id: 'x2',
    name: 'Pemerintahan',
    children: [
      { id: 'x2.1', name: 'Struktur Perangkat Desa', href: '/pemerintahan/profil/struktur-perangkat-desa' },
      { id: 'x2.2', name: 'Galeri Video', href: '/pemerintahan/galery/video' },
    ],
  },
  {
    id: 'x3',
    name: 'Layanan Online Desa',
    children: [
      {
        id: 'x3.1',
        name: 'Administrasi Online (Ajukan Surat)',
        href: '/inovasi/layanan-online-desa/administrasi-online',
      },
      {
        id: 'x3.2',
        name: 'Pengaduan Masyarakat',
        href: '/inovasi/layanan-online-desa/pengaduan-masyarakat',
      },
      { id: 'x3.3', name: 'Informasi Desa', href: '/inovasi/layanan-online-desa/informasi-desa' },
    ],
  },
  {
    id: 'x4',
    name: 'Kesehatan',
    children: [
      {
        id: 'x4.1',
        name: 'Fasilitas Kesehatan',
        href: '/kesehatan/data-kesehatan-warga/fasilitas-kesehatan-page',
      },
      {
        id: 'x4.2',
        name: 'Artikel Kesehatan',
        href: '/kesehatan/data-kesehatan-warga/artikel-kesehatan-page',
      },
      {
        id: 'x4.3',
        name: 'Jadwal Kegiatan Kesehatan',
        href: '/kesehatan/data-kesehatan-warga/jadwal-kegiatan-page',
      },
      { id: 'x4.4', name: 'Grafik Penyakit', href: '/kesehatan/data-kesehatan-warga/grafik-penyakit' },
    ],
  },
  {
    id: 'x5',
    name: 'Informasi',
    children: [{ id: 'x5.1', name: 'Peta Informasi (Semua Halaman)', href: '/peta-informasi' }],
  },
  {
    // Section di halaman Dashboard Kependudukan (navbar hanya satu butir). Href ditulis literal karena `src/con`
    // tidak boleh mengimpor dari folder halaman; kesamaannya dengan `kependudukanSectionHref` dijaga test
    // (__tests__/api/search_menu.test.ts). Nama memuat kata yang lazim diketik warga (banjar, umur/usia, agama,
    // kelahiran/kematian/pindah); kata "penduduk" sudah cocok lewat nama grup.
    id: 'x6',
    name: 'Kependudukan',
    children: [
      { id: 'x6.1', name: 'Penduduk per Banjar', href: '/kependudukan/dashboard#banjar' },
      { id: 'x6.2', name: 'Kelompok Umur (Usia)', href: '/kependudukan/dashboard#umur' },
      { id: 'x6.3', name: 'Agama Penduduk', href: '/kependudukan/dashboard#agama' },
      { id: 'x6.4', name: 'Dinamika Penduduk (Kelahiran, Kematian, Pindah)', href: '/kependudukan/dashboard#dinamika' },
    ],
  },
];

export default searchExtraPages;
