// ID adalah kontrak permanen: tersimpan di tabel UserMenuAccess (menuId).
// - ID section ("Landing Page", "Desa", …) = akses ke SEMUA submenu-nya. Jangan diubah.
// - ID submenu = slug `<section-slug>.<submenu-slug>` = akses ke submenu itu saja.
// basePath = prefix folder route yang dicakup menu (halaman list/create/edit/kategori
// di bawahnya), dicocokkan per segmen oleh menu-access.logic.ts. Dijaga contract test
// __tests__/api/menu_access_ids.contract.test.ts — jangan ubah tanpa migrasi data.
export type NavChild = { id: string; name: string; path: string; basePath: string }
export type NavItem = { id: string; name: string; path: string; basePath?: string; children?: NavChild[] }

export const landingPageMenu: NavItem = {
  id: "Landing Page",
  name: "Landing Page",
  path: "",
  children: [
    { id: "landing-page.profil", name: "Profil", path: "/admin/landing-page/profil/program-inovasi", basePath: "/admin/landing-page/profil" },
    { id: "landing-page.desa-anti-korupsi", name: "Desa Anti Korupsi", path: "/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi", basePath: "/admin/landing-page/desa-anti-korupsi" },
    { id: "landing-page.sdgs", name: "SDGs", path: "/admin/landing-page/SDGs", basePath: "/admin/landing-page/SDGs" },
    { id: "landing-page.apbdes", name: "APBDes", path: "/admin/landing-page/apbdes", basePath: "/admin/landing-page/apbdes" },
    { id: "landing-page.prestasi-desa", name: "Prestasi dan Penghargaan", path: "/admin/landing-page/prestasi-desa/list-prestasi-desa", basePath: "/admin/landing-page/prestasi-desa" },
  ],
}

export const ppidMenu: NavItem = {
  id: "PPID",
  name: "PPID",
  path: "",
  children: [
    { id: "ppid.profil-ppid", name: "Profil PPID", path: "/admin/ppid/profil-ppid", basePath: "/admin/ppid/profil-ppid" },
    { id: "ppid.struktur-ppid", name: "Struktur PPID", path: "/admin/ppid/struktur-ppid/pegawai", basePath: "/admin/ppid/struktur-ppid" },
    { id: "ppid.visi-misi-ppid", name: "Visi Misi PPID", path: "/admin/ppid/visi-misi-ppid", basePath: "/admin/ppid/visi-misi-ppid" },
    { id: "ppid.dasar-hukum", name: "Dasar Hukum", path: "/admin/ppid/dasar-hukum", basePath: "/admin/ppid/dasar-hukum" },
    { id: "ppid.permohonan-informasi-publik", name: "Permohonan Informasi Publik", path: "/admin/ppid/permohonan-informasi-publik", basePath: "/admin/ppid/permohonan-informasi-publik" },
    { id: "ppid.permohonan-keberatan-informasi-publik", name: "Permohonan Keberatan Informasi Publik", path: "/admin/ppid/permohonan-keberatan-informasi-publik", basePath: "/admin/ppid/permohonan-keberatan-informasi-publik" },
    { id: "ppid.daftar-informasi-publik", name: "Daftar Informasi Publik", path: "/admin/ppid/daftar-informasi-publik", basePath: "/admin/ppid/daftar-informasi-publik" },
    { id: "ppid.indeks-kepuasan-masyarakat", name: "Indeks Kepuasan Masyarakat", path: "/admin/ppid/indeks-kepuasan-masyarakat/grafik-kepuasan-masyarakat", basePath: "/admin/ppid/indeks-kepuasan-masyarakat" },
  ],
}

export const desaMenu: NavItem = {
  id: "Desa",
  name: "Pemerintahan",
  path: "",
  children: [
    { id: "desa.profil", name: "Profil", path: "/admin/pemerintahan/profil/profil-desa", basePath: "/admin/pemerintahan/profil" },
    { id: "desa.potensi", name: "Potensi", path: "/admin/pemerintahan/potensi/list-potensi", basePath: "/admin/pemerintahan/potensi" },
    { id: "desa.berita", name: "Berita", path: "/admin/pemerintahan/berita/list-berita", basePath: "/admin/pemerintahan/berita" },
    { id: "desa.pengumuman", name: "Pengumuman", path: "/admin/pemerintahan/pengumuman/list-pengumuman", basePath: "/admin/pemerintahan/pengumuman" },
    { id: "desa.gallery", name: "Gallery", path: "/admin/pemerintahan/gallery/foto", basePath: "/admin/pemerintahan/gallery" },
    { id: "desa.layanan", name: "Layanan", path: "/admin/pemerintahan/layanan/pelayanan_surat_keterangan", basePath: "/admin/pemerintahan/layanan" },
    { id: "desa.kegiatan-desa", name: "Kegiatan Desa", path: "/admin/pemerintahan/kegiatan-desa/list-kegiatan-desa", basePath: "/admin/pemerintahan/kegiatan-desa" },
    { id: "desa.event-budaya", name: "Agenda & Kalender Desa", path: "/admin/pemerintahan/event-budaya", basePath: "/admin/pemerintahan/event-budaya" },
    { id: "desa.banjar", name: "Banjar", path: "/admin/pemerintahan/banjar", basePath: "/admin/pemerintahan/banjar" },
    { id: "desa.struktur-perangkat-desa", name: "Struktur Perangkat Desa", path: "/admin/pemerintahan/struktur-perangkat-desa/pegawai", basePath: "/admin/pemerintahan/struktur-perangkat-desa" },
  ],
}

export const kesehatanMenu: NavItem = {
  id: "Kesehatan",
  name: "Kesehatan",
  path: "",
  children: [
    { id: "kesehatan.posyandu", name: "Posyandu", path: "/admin/kesehatan/posyandu/list-posyandu", basePath: "/admin/kesehatan/posyandu" },
    { id: "kesehatan.data-kesehatan-warga", name: "Data Kesehatan Warga", path: "/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian", basePath: "/admin/kesehatan/data-kesehatan-warga" },
    { id: "kesehatan.puskesmas", name: "Puskesmas", path: "/admin/kesehatan/puskesmas", basePath: "/admin/kesehatan/puskesmas" },
    { id: "kesehatan.program-kesehatan", name: "Program Kesehatan", path: "/admin/kesehatan/program-kesehatan", basePath: "/admin/kesehatan/program-kesehatan" },
    { id: "kesehatan.penanganan-darurat", name: "Penanganan Darurat", path: "/admin/kesehatan/penanganan-darurat", basePath: "/admin/kesehatan/penanganan-darurat" },
    { id: "kesehatan.kontak-darurat", name: "Kontak Darurat", path: "/admin/kesehatan/kontak-darurat", basePath: "/admin/kesehatan/kontak-darurat" },
    { id: "kesehatan.info-wabah-penyakit", name: "Info Wabah/Penyakit", path: "/admin/kesehatan/info-wabah-penyakit", basePath: "/admin/kesehatan/info-wabah-penyakit" },
  ],
}

export const keamananMenu: NavItem = {
  id: "Keamanan",
  name: "Keamanan",
  path: "",
  children: [
    { id: "keamanan.keamanan-lingkungan-pecalang-patwal", name: "Keamanan Lingkungan (Pecalang/Patwal)", path: "/admin/keamanan/keamanan-lingkungan-pecalang-patwal", basePath: "/admin/keamanan/keamanan-lingkungan-pecalang-patwal" },
    { id: "keamanan.polsek-terdekat", name: "Polsek Terdekat", path: "/admin/keamanan/polsek-terdekat/daftar-polsek-terdekat", basePath: "/admin/keamanan/polsek-terdekat" },
    { id: "keamanan.kontak-darurat", name: "Kontak Darurat", path: "/admin/keamanan/kontak-darurat/kontak-darurat-keamanan", basePath: "/admin/keamanan/kontak-darurat" },
    { id: "keamanan.pencegahan-kriminalitas", name: "Pencegahan Kriminalitas", path: "/admin/keamanan/pencegahan-kriminalitas", basePath: "/admin/keamanan/pencegahan-kriminalitas" },
    { id: "keamanan.laporan-publik", name: "Laporan Publik", path: "/admin/keamanan/laporan-publik", basePath: "/admin/keamanan/laporan-publik" },
    { id: "keamanan.tips-keamanan", name: "Tips Keamanan", path: "/admin/keamanan/tips-keamanan", basePath: "/admin/keamanan/tips-keamanan" },
    { id: "keamanan.cctv", name: "CCTV", path: "/admin/keamanan/cctv", basePath: "/admin/keamanan/cctv" },
  ],
}

export const ekonomiMenu: NavItem = {
  id: "Ekonomi",
  name: "Ekonomi",
  path: "",
  children: [
    // UMKM masuk lewat Data UMKM selama tab Dashboard disembunyikan — docs/debt/2026-11-12-umkm-tab-disembunyikan.md
    { id: "ekonomi.umkm", name: "UMKM", path: "/admin/ekonomi/umkm/data-umkm", basePath: "/admin/ekonomi/umkm" },
    { id: "ekonomi.lowongan-kerja-lokal", name: "Lowongan Kerja Lokal", path: "/admin/ekonomi/lowongan-kerja-lokal", basePath: "/admin/ekonomi/lowongan-kerja-lokal" },
    { id: "ekonomi.bumdes", name: "BUMDes", path: "/admin/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/profil", basePath: "/admin/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes" },
    { id: "ekonomi.padesa", name: "PADesa (Pendapatan Asli Desa)", path: "/admin/ekonomi/PADesa-pendapatan-asli-desa/apbdesa", basePath: "/admin/ekonomi/PADesa-pendapatan-asli-desa" },
    { id: "ekonomi.jumlah-pengangguran", name: "Jumlah Pengangguran", path: "/admin/ekonomi/jumlah-pengangguran", basePath: "/admin/ekonomi/jumlah-pengangguran" },
    { id: "ekonomi.jumlah-penduduk-usia-kerja-yang-menganggur", name: "Jumlah penduduk usia kerja yang menganggur", path: "/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_usia", basePath: "/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur" },
    { id: "ekonomi.jumlah-penduduk-miskin", name: "Jumlah Penduduk Miskin", path: "/admin/ekonomi/jumlah-penduduk-miskin", basePath: "/admin/ekonomi/jumlah-penduduk-miskin" },
    { id: "ekonomi.program-kemiskinan", name: "Program Pengentasan Kemiskinan", path: "/admin/ekonomi/program-kemiskinan", basePath: "/admin/ekonomi/program-kemiskinan" },
    { id: "ekonomi.sektor-unggulan-desa", name: "Sektor Unggulan Desa", path: "/admin/ekonomi/sektor-unggulan-desa", basePath: "/admin/ekonomi/sektor-unggulan-desa" },
    { id: "ekonomi.demografi-pekerjaan", name: "Demografi Pekerjaan", path: "/admin/ekonomi/demografi-pekerjaan", basePath: "/admin/ekonomi/demografi-pekerjaan" },
    { id: "ekonomi.kesejahteraan-masyarakat", name: "Kesejahteraan Masyarakat", path: "/admin/ekonomi/kesejahteraan-masyarakat", basePath: "/admin/ekonomi/kesejahteraan-masyarakat" },
  ],
}

export const inovasiMenu: NavItem = {
  id: "Inovasi",
  name: "Inovasi",
  path: "",
  children: [
    { id: "inovasi.desa-digital-smart-village", name: "Desa Digital/Smart Village", path: "/admin/inovasi/desa-digital-smart-village", basePath: "/admin/inovasi/desa-digital-smart-village" },
    { id: "inovasi.layanan-online-desa", name: "Layanan Online Desa", path: "/admin/inovasi/layanan-online-desa/administrasi-online", basePath: "/admin/inovasi/layanan-online-desa" },
    { id: "inovasi.program-kreatif-desa", name: "Program Kreatif Desa", path: "/admin/inovasi/program-kreatif-desa", basePath: "/admin/inovasi/program-kreatif-desa" },
    { id: "inovasi.kolaborasi-inovasi", name: "Kolaborasi Inovasi", path: "/admin/inovasi/kolaborasi-inovasi/list-kolaborasi-inovasi", basePath: "/admin/inovasi/kolaborasi-inovasi" },
    { id: "inovasi.info-teknologi-tepat-guna", name: "Info Teknologi Tepat Guna", path: "/admin/inovasi/info-teknologi-tepat-guna", basePath: "/admin/inovasi/info-teknologi-tepat-guna" },
    { id: "inovasi.ajukan-ide-inovatif", name: "Ajukan Ide Inovatif", path: "/admin/inovasi/ajukan-ide-inovatif", basePath: "/admin/inovasi/ajukan-ide-inovatif" },
  ],
}

export const lingkunganMenu: NavItem = {
  id: "Lingkungan",
  name: "Lingkungan",
  path: "",
  children: [
    { id: "lingkungan.pengelolaan-sampah-bank-sampah", name: "Pengelolaan Sampah (Bank Sampah)", path: "/admin/lingkungan/pengelolaan-sampah-bank-sampah/list-pengelolaan-sampah-bank-sampah", basePath: "/admin/lingkungan/pengelolaan-sampah-bank-sampah" },
    { id: "lingkungan.program-penghijauan", name: "Program Penghijauan", path: "/admin/lingkungan/program-penghijauan", basePath: "/admin/lingkungan/program-penghijauan" },
    { id: "lingkungan.data-lingkungan-desa", name: "Data Lingkungan Desa", path: "/admin/lingkungan/data-lingkungan-desa", basePath: "/admin/lingkungan/data-lingkungan-desa" },
    { id: "lingkungan.gotong-royong", name: "Gotong Royong", path: "/admin/lingkungan/gotong-royong/kegiatan-desa", basePath: "/admin/lingkungan/gotong-royong" },
    { id: "lingkungan.edukasi-lingkungan", name: "Edukasi Lingkungan", path: "/admin/lingkungan/edukasi-lingkungan/tujuan-edukasi-lingkungan", basePath: "/admin/lingkungan/edukasi-lingkungan" },
    { id: "lingkungan.konservasi-adat-bali", name: "Konservasi Adat Bali", path: "/admin/lingkungan/konservasi-adat-bali/filosofi-tri-hita-karana", basePath: "/admin/lingkungan/konservasi-adat-bali" },
  ],
}

export const pendidikanMenu: NavItem = {
  id: "Pendidikan",
  name: "Pendidikan",
  path: "",
  children: [
    { id: "pendidikan.info-sekolah", name: "Info Sekolah", path: "/admin/pendidikan/info-sekolah/jenjang-pendidikan", basePath: "/admin/pendidikan/info-sekolah" },
    { id: "pendidikan.beasiswa-desa", name: "Beasiswa Desa", path: "/admin/pendidikan/beasiswa-desa/beasiswa-pendaftar", basePath: "/admin/pendidikan/beasiswa-desa" },
    { id: "pendidikan.program-pendidikan-anak", name: "Program Pendidikan Anak", path: "/admin/pendidikan/program-pendidikan-anak/tujuan-program", basePath: "/admin/pendidikan/program-pendidikan-anak" },
    { id: "pendidikan.bimbingan-belajar-desa", name: "Bimbingan Belajar Desa", path: "/admin/pendidikan/bimbingan-belajar-desa/tujuan-program", basePath: "/admin/pendidikan/bimbingan-belajar-desa" },
    { id: "pendidikan.pendidikan-non-formal", name: "Pendidikan Non Formal", path: "/admin/pendidikan/pendidikan-non-formal/tujuan-program", basePath: "/admin/pendidikan/pendidikan-non-formal" },
    { id: "pendidikan.perpustakaan-digital", name: "Perpustakaan Digital", path: "/admin/pendidikan/perpustakaan-digital/data-perpustakaan", basePath: "/admin/pendidikan/perpustakaan-digital" },
    { id: "pendidikan.data-pendidikan", name: "Data Pendidikan", path: "/admin/pendidikan/data-pendidikan", basePath: "/admin/pendidikan/data-pendidikan" },
  ],
}

export const kependudukanMenu: NavItem = {
  id: "Kependudukan",
  name: "Kependudukan",
  path: "",
  children: [
    { id: "kependudukan.distribusi-agama", name: "Distribusi Agama", path: "/admin/kependudukan/distribusi-agama", basePath: "/admin/kependudukan/distribusi-agama" },
    { id: "kependudukan.distribusi-umur", name: "Distribusi Umur", path: "/admin/kependudukan/distribusi-umur", basePath: "/admin/kependudukan/distribusi-umur" },
    { id: "kependudukan.data-banjar", name: "Data Banjar", path: "/admin/kependudukan/data-banjar", basePath: "/admin/kependudukan/data-banjar" },
    { id: "kependudukan.migrasi-penduduk", name: "Migrasi Penduduk", path: "/admin/kependudukan/migrasi-penduduk", basePath: "/admin/kependudukan/migrasi-penduduk" },
  ],
}

export const musikMenu: NavItem = {
  id: "Musik",
  name: "Musik",
  path: "/admin/musik",
  basePath: "/admin/musik",
}

export const userRoleMenu: NavItem = {
  id: "User & Role",
  name: "User & Role",
  path: "",
  children: [
    { id: "user-role.user", name: "User", path: "/admin/user&role/user", basePath: "/admin/user&role/user" },
    { id: "user-role.role", name: "Role", path: "/admin/user&role/role", basePath: "/admin/user&role/role" },
  ],
}

// Hanya role "0"/"1" (ditambahkan getNavbar). Sengaja TIDAK masuk navBar/devBar supaya
// tidak bisa diberikan ke role lain lewat halaman Menu Access.
export const pengaturanMenu: NavItem = {
  id: "Pengaturan",
  name: "Pengaturan",
  path: "",
  children: [
    { id: "pengaturan.visibilitas-menu", name: "Visibilitas Menu", path: "/admin/pengaturan/visibilitas-menu", basePath: "/admin/pengaturan/visibilitas-menu" },
    { id: "pengaturan.menu-access", name: "Menu Access", path: "/admin/pengaturan/menu-access", basePath: "/admin/pengaturan/menu-access" },
    { id: "pengaturan.sampah", name: "Sampah", path: "/admin/pengaturan/sampah", basePath: "/admin/pengaturan/sampah" },
  ],
}
