import { getSosmedHref } from '@/app/admin/(dashboard)/landing-page/profil/_lib/sosmed';
import { isPathHidden } from './menu-visibility.logic';

type SearchItem = { type?: string; id: string | number;[key: string]: unknown };

const getDetailUrl = (item: SearchItem) => {
  const { type, id, kategori } = item;
  const map: Record<string, (id: string | number, kategori?: string, item?: SearchItem) => string> = {
    programinovasi: (id) => `/program-inovasi/${id}`,
    // Tujuan media sosial adalah link eksternal; kosong → beranda (tempat ikon sosmed tampil).
    mediaSosial: (_id, _kategori, item) =>
      getSosmedHref(item?.icon as string | null, item?.iconUrl as string | null) ?? '/',
    desaantikorupsi: () => '/desa-anti-korupsi',
    sdgsdesa: () => '/sdgs-desa',
    apbdes: () => '/apbdes',
    // Termasuk entri eks-Penghargaan (kini kategori "Penghargaan" di tabel PrestasiDesa).
    prestasidesa: (id) => `/prestasi-desa/${id}`,
    pejabatdesa: () => '/ppid/profil-ppid',
    strukturppid: () => '/ppid/struktur-ppid',
    visimisippid: () => '/ppid/visi-misi-ppid',
    dasarhukumppid: () => '/ppid/dasar-hukum',
    profileppid: () => '/ppid/profil-ppid',
    daftarinformasipublik: () => '/ppid/daftar-informasi-publik',
    ikm: () => '/ppid/indeks-kepuasan-masyarakat',
    perbekeldarmasaba: () => '/pemerintahan/profil',
    berita: (id, kategori) => `/pemerintahan/berita/${kategori}/${id}`,
    // Slug lowercase, sama dengan tab kategori di halaman berita.
    kategoriBerita: (_id, _kategori, item) =>
      `/pemerintahan/berita/${encodeURIComponent(String(item?.name ?? '').toLowerCase())}`,
    pengumuman: (id, kategori) => `/pemerintahan/pengumuman/${kategori}/${id}`,
    sejarahdesa: () => '/pemerintahan/profil',
    visimisidesa: () => '/pemerintahan/profil',
    lambangdesa: () => '/pemerintahan/profil',
    maskotdesa: () => '/pemerintahan/profil',
    profilperbekel: () => '/pemerintahan/profil',
    potensi: () => '/pemerintahan/potensi',
    galleryFoto: () => '/pemerintahan/galery/foto',
    galleryVideo: () => '/pemerintahan/galery/video',
    pelayananSuratKeterangan: () => '/pemerintahan/layanan',
    pelayananPerizinanBerusaha: () => '/pemerintahan/layanan',
    pelayananTelunjukSaktiDesa: () => '/pemerintahan/layanan',
    pelayananPendudukNonPermanen: () => '/pemerintahan/layanan',
    posyandu: (id) => `/kesehatan/posyandu/${id}`,
    fasilitasKesehatan: () => '/kesehatan/data-kesehatan-warga',
    dokterdanTenagaMedis: () => '/kesehatan/data-kesehatan-warga',
    tarifDanLayanan: () => '/kesehatan/data-kesehatan-warga',
    jadwalKegiatan: () => '/kesehatan/data-kesehatan-warga',
    artikelKesehatan: () => '/kesehatan/data-kesehatan-warga',
    puskesmas: () => '/kesehatan/puskesmas',
    programKesehatan: () => '/kesehatan/program-kesehatan',
    penangananDarurat: () => '/kesehatan/penanganan-darurat',
    kontakDarurat: () => '/kesehatan/kontak-darurat',
    infoWabahPenyakit: () => '/kesehatan/info-wabah-penyakit',
    keamananLingkungan: () => '/keamanan/keamanan-lingkungan-pecalang-patwal',
    polsekTerdekat: () => '/keamanan/polsek-terdekat',
    kontakDaruratKeamanan: () => '/keamanan/kontak-darurat',
    pencegahanKriminalitas: () => '/keamanan/pencegahan-kriminalitas',
    laporanPublik: () => '/keamanan/laporan-publik',
    tipsKeamanan: () => '/keamanan/tips-keamanan',
    pasarDesa: (id) => `/ekonomi/umkm/produk/${id}`,
    lowonganKerjaLokal: () => '/ekonomi/lowongan-kerja-lokal',
    // Pegawai BUMDes → profilnya di bawah halaman Struktur Pengurus BUMDes.
    strukturOrganisasi: (id) => `/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/${id}`,
    jumlahPendudukUsiaKerjaYangMenganggurUsia: () => '/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur',
    jumlahPendudukUsiaKerjaYangMenganggurPendidikan: () => '/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur',
    jumlahPendudukMiskin: () => '/ekonomi/jumlah-penduduk-miskin',
    programKemiskinan: () => '/ekonomi/program-kemiskinan',
    sektorUnggulanDesa: () => '/ekonomi/sektor-unggulan-desa',
    demografiPekerjaan: () => '/ekonomi/demografi-pekerjaan',
    desaDigital: () => '/inovasi/desa-digital-smart-village',
    programKreatif: () => '/inovasi/program-kreatif-desa',
    kolaborasiInovasi: () => '/inovasi/kolaborasi-inovasi',
    mitraKolaborasi: () => '/inovasi/kolaborasi-inovasi',
    infoTekno: () => '/inovasi/info-teknologi-tepat-guna',
    pengelolaanSampah: () => '/lingkungan/pengelolaan-sampah-bank-sampah',
    keteranganBankSampahTerdekat: () => '/lingkungan/pengelolaan-sampah-bank-sampah',
    programPenghijauan: () => '/lingkungan/program-penghijauan',
    dataLingkunganDesa: () => '/lingkungan/data-lingkungan-desa',
    gotongRoyong: (id, kategori) => `/lingkungan/gotong-royong/${kategori}/${id}`,
    tujuanEdukasiLingkungan: () => '/lingkungan/edukasi-lingkungan',
    materiEdukasiLingkungan: () => '/lingkungan/edukasi-lingkungan',
    contohEdukasiLingkungan: () => '/lingkungan/edukasi-lingkungan',
    filosofiTriHita: () => '/lingkungan/konservasi-adat-bali',
    bentukKonservasiBerdasarkanAdat: () => '/lingkungan/konservasi-adat-bali',
    nilaiKonservasiAdat: () => '/lingkungan/konservasi-adat-bali',
    jenjangPendidikan: () => '/pendidikan/info-sekolah/semua',
    lembaga: () => '/pendidikan/info-sekolah/semua/lembaga',
    siswa: () => '/pendidikan/info-sekolah/semua/siswa',
    pengajar: () => '/pendidikan/info-sekolah/semua/pengajar',
    keunggulanProgram: () => '/pendidikan/beasiswa-desa',
    tujuanProgram: () => '/pendidikan/program-pendidikan-anak',
    programUnggulan: () => '/pendidikan/program-pendidikan-anak',
    lokasiJadwalBimbinganBelajarDesa: () => '/pendidikan/bimbingan-belajar-desa',
    fasilitasBimbinganBelajarDesa: () => '/pendidikan/bimbingan-belajar-desa',
    tujuanPendidikanNonFormal: () => '/pendidikan/pendidikan-non-formal',
    tempatKegiatan: () => '/pendidikan/pendidikan-non-formal',
    jenisProgramYangDiselenggarakan: () => '/pendidikan/pendidikan-non-formal',
    dataPerpustakaan: () => '/pendidikan/perpustakaan-digital/semua',
    dataPendidikan: () => '/pendidikan/data-pendidikan',

  };

  if (type && map[type]) return map[type](id, kategori as string | undefined, item);
  return '/';
};

/** Normalisasi `type` hasil pencarian sebelum lookup peta: hanya trim, huruf tidak diubah (kunci peta camelCase). */
export const normalizeSearchType = (type: unknown) => String(type ?? '').trim();

/**
 * Benar bila hasil pencarian konten menuju halaman di bawah submenu tersembunyi (halaman itu 404),
 * memakai pencocokan per segmen yang sama dengan guard 404.
 */
export const isSearchResultHidden = (item: SearchItem, hiddenHrefs: readonly string[]) =>
  isPathHidden(getDetailUrl({ ...item, type: normalizeSearchType(item.type) }), hiddenHrefs);

export default getDetailUrl;
