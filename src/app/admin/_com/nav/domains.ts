export type NavChild = { id: string; name: string; path: string }
export type NavItem = { id: string; name: string; path: string; children?: NavChild[] }

export const landingPageMenu: NavItem = {
  id: "Landing Page",
  name: "Landing Page",
  path: "",
  children: [
    { id: "Landing_Page_1", name: "Profil", path: "/admin/landing-page/profil/program-inovasi" },
    { id: "Landing_Page_2", name: "Desa Anti Korupsi", path: "/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi" },
    { id: "Landing_Page_3", name: "SDGs", path: "/admin/landing-page/SDGs" },
    { id: "Landing_Page_4", name: "APBDes", path: "/admin/landing-page/apbdes" },
    { id: "Landing_Page_5", name: "Prestasi dan Penghargaan", path: "/admin/landing-page/prestasi-desa/list-prestasi-desa" },
  ],
}

export const ppidMenu: NavItem = {
  id: "PPID",
  name: "PPID",
  path: "",
  children: [
    { id: "PPID_1", name: "Profil PPID", path: "/admin/ppid/profil-ppid" },
    { id: "PPID_2", name: "Struktur PPID", path: "/admin/ppid/struktur-ppid/pegawai" },
    { id: "PPID_3", name: "Visi Misi PPID", path: "/admin/ppid/visi-misi-ppid" },
    { id: "PPID_4", name: "Dasar Hukum", path: "/admin/ppid/dasar-hukum" },
    { id: "PPID_5", name: "Permohonan Informasi Publik", path: "/admin/ppid/permohonan-informasi-publik" },
    { id: "PPID_6", name: "Permohonan Keberatan Informasi Publik", path: "/admin/ppid/permohonan-keberatan-informasi-publik" },
    { id: "PPID_7", name: "Daftar Informasi Publik", path: "/admin/ppid/daftar-informasi-publik" },
    { id: "PPID_8", name: "Indeks Kepuasan Masyarakat", path: "/admin/ppid/indeks-kepuasan-masyarakat/grafik-kepuasan-masyarakat" },
  ],
}

export const desaMenu: NavItem = {
  id: "Desa",
  name: "Pemerintahan",
  path: "",
  children: [
    { id: "Desa_1", name: "Profil", path: "/admin/pemerintahan/profil/profil-desa" },
    { id: "Desa_2", name: "Potensi", path: "/admin/pemerintahan/potensi/list-potensi" },
    { id: "Desa_3", name: "Berita", path: "/admin/pemerintahan/berita/list-berita" },
    { id: "Desa_4", name: "Pengumuman", path: "/admin/pemerintahan/pengumuman/list-pengumuman" },
    { id: "Desa_5", name: "Gallery", path: "/admin/pemerintahan/gallery/foto" },
    { id: "Desa_6", name: "Layanan", path: "/admin/pemerintahan/layanan/pelayanan_surat_keterangan" },
    { id: "Desa_8", name: "Kegiatan Desa", path: "/admin/pemerintahan/kegiatan-desa/list-kegiatan-desa" },
    { id: "Desa_9", name: "Agenda & Kalender Desa", path: "/admin/pemerintahan/event-budaya" },
    { id: "Desa_10", name: "Banjar", path: "/admin/pemerintahan/banjar" },
    { id: "Desa_11", name: "Struktur Perangkat Desa", path: "/admin/pemerintahan/struktur-perangkat-desa/pegawai" },
  ],
}

export const kesehatanMenu: NavItem = {
  id: "Kesehatan",
  name: "Kesehatan",
  path: "",
  children: [
    { id: "Kesehatan_1", name: "Posyandu", path: "/admin/kesehatan/posyandu/list-posyandu" },
    { id: "Kesehatan_2", name: "Data Kesehatan Warga", path: "/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian" },
    { id: "Kesehatan_3", name: "Puskesmas", path: "/admin/kesehatan/puskesmas" },
    { id: "Kesehatan_4", name: "Program Kesehatan", path: "/admin/kesehatan/program-kesehatan" },
    { id: "Kesehatan_5", name: "Penanganan Darurat", path: "/admin/kesehatan/penanganan-darurat" },
    { id: "Kesehatan_6", name: "Kontak Darurat", path: "/admin/kesehatan/kontak-darurat" },
    { id: "Kesehatan_7", name: "Info Wabah/Penyakit", path: "/admin/kesehatan/info-wabah-penyakit" },
  ],
}

export const keamananMenu: NavItem = {
  id: "Keamanan",
  name: "Keamanan",
  path: "",
  children: [
    { id: "Keamanan_1", name: "Keamanan Lingkungan (Pecalang/Patwal)", path: "/admin/keamanan/keamanan-lingkungan-pecalang-patwal" },
    { id: "Keamanan_2", name: "Polsek Terdekat", path: "/admin/keamanan/polsek-terdekat/daftar-polsek-terdekat" },
    { id: "Keamanan_3", name: "Kontak Darurat", path: "/admin/keamanan/kontak-darurat/kontak-darurat-keamanan" },
    { id: "Keamanan_4", name: "Pencegahan Kriminalitas", path: "/admin/keamanan/pencegahan-kriminalitas" },
    { id: "Keamanan_5", name: "Laporan Publik", path: "/admin/keamanan/laporan-publik" },
    { id: "Keamanan_6", name: "Tips Keamanan", path: "/admin/keamanan/tips-keamanan" },
    { id: "Keamanan_7", name: "CCTV", path: "/admin/keamanan/cctv" },
  ],
}

export const ekonomiMenu: NavItem = {
  id: "Ekonomi",
  name: "Ekonomi",
  path: "",
  children: [
    { id: "Ekonomi_UMKM_1", name: "UMKM", path: "/admin/ekonomi/umkm/dashboard" },
    { id: "Ekonomi_2", name: "Lowongan Kerja Lokal", path: "/admin/ekonomi/lowongan-kerja-lokal" },
    { id: "Ekonomi_3", name: "BUMDes", path: "/admin/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/profil" },
    { id: "Ekonomi_4", name: "PADesa (Pendapatan Asli Desa)", path: "/admin/ekonomi/PADesa-pendapatan-asli-desa/apbdesa" },
    { id: "Ekonomi_5", name: "Jumlah Pengangguran", path: "/admin/ekonomi/jumlah-pengangguran" },
    { id: "Ekonomi_6", name: "Jumlah penduduk usia kerja yang menganggur", path: "/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_usia" },
    { id: "Ekonomi_7", name: "Jumlah Penduduk Miskin", path: "/admin/ekonomi/jumlah-penduduk-miskin" },
    { id: "Ekonomi_8", name: "Program Pengentasan Kemiskinan", path: "/admin/ekonomi/program-kemiskinan" },
    { id: "Ekonomi_9", name: "Sektor Unggulan Desa", path: "/admin/ekonomi/sektor-unggulan-desa" },
    { id: "Ekonomi_10", name: "Demografi Pekerjaan", path: "/admin/ekonomi/demografi-pekerjaan" },
    { id: "Ekonomi_11", name: "Kesejahteraan Masyarakat", path: "/admin/ekonomi/kesejahteraan-masyarakat" },
  ],
}

export const inovasiMenu: NavItem = {
  id: "Inovasi",
  name: "Inovasi",
  path: "",
  children: [
    { id: "Inovasi_1", name: "Desa Digital/Smart Village", path: "/admin/inovasi/desa-digital-smart-village" },
    { id: "Inovasi_2", name: "Layanan Online Desa", path: "/admin/inovasi/layanan-online-desa/administrasi-online" },
    { id: "Inovasi_3", name: "Program Kreatif Desa", path: "/admin/inovasi/program-kreatif-desa" },
    { id: "Inovasi_4", name: "Kolaborasi Inovasi", path: "/admin/inovasi/kolaborasi-inovasi/list-kolaborasi-inovasi" },
    { id: "Inovasi_5", name: "Info Teknologi Tepat Guna", path: "/admin/inovasi/info-teknologi-tepat-guna" },
    { id: "Inovasi_6", name: "Ajukan Ide Inovatif", path: "/admin/inovasi/ajukan-ide-inovatif" },
  ],
}

export const lingkunganMenu: NavItem = {
  id: "Lingkungan",
  name: "Lingkungan",
  path: "",
  children: [
    { id: "Lingkungan_1", name: "Pengelolaan Sampah (Bank Sampah)", path: "/admin/lingkungan/pengelolaan-sampah-bank-sampah/list-pengelolaan-sampah-bank-sampah" },
    { id: "Lingkungan_2", name: "Program Penghijauan", path: "/admin/lingkungan/program-penghijauan" },
    { id: "Lingkungan_3", name: "Data Lingkungan Desa", path: "/admin/lingkungan/data-lingkungan-desa" },
    { id: "Lingkungan_4", name: "Gotong Royong", path: "/admin/lingkungan/gotong-royong/kegiatan-desa" },
    { id: "Lingkungan_5", name: "Edukasi Lingkungan", path: "/admin/lingkungan/edukasi-lingkungan/tujuan-edukasi-lingkungan" },
    { id: "Lingkungan_6", name: "Konservasi Adat Bali", path: "/admin/lingkungan/konservasi-adat-bali/filosofi-tri-hita-karana" },
  ],
}

export const pendidikanMenu: NavItem = {
  id: "Pendidikan",
  name: "Pendidikan",
  path: "",
  children: [
    { id: "Pendidikan_1", name: "Info Sekolah", path: "/admin/pendidikan/info-sekolah/jenjang-pendidikan" },
    { id: "Pendidikan_2", name: "Beasiswa Desa", path: "/admin/pendidikan/beasiswa-desa/beasiswa-pendaftar" },
    { id: "Pendidikan_3", name: "Program Pendidikan Anak", path: "/admin/pendidikan/program-pendidikan-anak/tujuan-program" },
    { id: "Pendidikan_4", name: "Bimbingan Belajar Desa", path: "/admin/pendidikan/bimbingan-belajar-desa/tujuan-program" },
    { id: "Pendidikan_5", name: "Pendidikan Non Formal", path: "/admin/pendidikan/pendidikan-non-formal/tujuan-program" },
    { id: "Pendidikan_6", name: "Perpustakaan Digital", path: "/admin/pendidikan/perpustakaan-digital/data-perpustakaan" },
    { id: "Pendidikan_7", name: "Data Pendidikan", path: "/admin/pendidikan/data-pendidikan" },
  ],
}

export const kependudukanMenu: NavItem = {
  id: "Kependudukan",
  name: "Kependudukan",
  path: "",
  children: [
    { id: "Kependudukan_1", name: "Distribusi Agama", path: "/admin/kependudukan/distribusi-agama" },
    { id: "Kependudukan_2", name: "Distribusi Umur", path: "/admin/kependudukan/distribusi-umur" },
    { id: "Kependudukan_3", name: "Data Banjar", path: "/admin/kependudukan/data-banjar" },
    { id: "Kependudukan_4", name: "Migrasi Penduduk", path: "/admin/kependudukan/migrasi-penduduk" },
  ],
}

export const musikMenu: NavItem = {
  id: "Musik",
  name: "Musik",
  path: "/admin/musik",
}

export const userRoleMenu: NavItem = {
  id: "User & Role",
  name: "User & Role",
  path: "",
  children: [
    { id: "User", name: "User", path: "/admin/user&role/user" },
    { id: "Role", name: "Role", path: "/admin/user&role/role" },
    { id: "Menu Access", name: "Menu Access", path: "/admin/user&role/menu-access" },
  ],
}

// Hanya role "0"/"1" (ditambahkan getNavbar). Sengaja TIDAK masuk navBar/devBar supaya
// tidak bisa diberikan ke role lain lewat halaman Menu Access.
export const pengaturanMenu: NavItem = {
  id: "Pengaturan",
  name: "Pengaturan",
  path: "",
  children: [
    { id: "Pengaturan_1", name: "Visibilitas Menu", path: "/admin/pengaturan/visibilitas-menu" },
  ],
}
