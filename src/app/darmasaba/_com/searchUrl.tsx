import { getSosmedHref } from '@/app/admin/(dashboard)/landing-page/profil/_lib/sosmed';

type SearchItem = { type?: string; id: string | number;[key: string]: unknown };

const getDetailUrl = (item: SearchItem) => {
  const { type, id, kategori } = item;
  const map: Record<string, (id: string | number, kategori?: string, item?: SearchItem) => string> = {
    programinovasi: (id) => `/darmasaba/program-inovasi/${id}`,
    // Tujuan media sosial adalah link eksternal; kosong → beranda (tempat ikon sosmed tampil).
    mediaSosial: (_id, _kategori, item) =>
      getSosmedHref(item?.icon as string | null, item?.iconUrl as string | null) ?? '/darmasaba',
    desaantikorupsi: () => '/darmasaba/desa-anti-korupsi',
    sdgsdesa: () => '/darmasaba/sdgs-desa',
    apbdes: () => '/darmasaba/apbdes',
    // Termasuk entri eks-Penghargaan (kini kategori "Penghargaan" di tabel PrestasiDesa).
    prestasidesa: (id) => `/darmasaba/prestasi-desa/${id}`,
    pejabatdesa: () => '/darmasaba/ppid/profil-ppid',
    strukturppid: () => '/darmasaba/ppid/struktur-ppid',
    visimisippid: () => '/darmasaba/ppid/visi-misi-ppid',
    dasarhukumppid: () => '/darmasaba/ppid/dasar-hukum',
    profileppid: () => '/darmasaba/ppid/profil-ppid',
    daftarinformasipublik: () => '/darmasaba/ppid/daftar-informasi-publik',
    ikm: () => '/darmasaba/ppid/indeks-kepuasan-masyarakat',
    perbekeldarmasaba: () => '/darmasaba/pemerintahan/profil',
    berita: (id, kategori) => `/darmasaba/pemerintahan/berita/${kategori}/${id}`,
    // Slug lowercase, sama dengan tab kategori di halaman berita.
    kategoriBerita: (_id, _kategori, item) =>
      `/darmasaba/pemerintahan/berita/${encodeURIComponent(String(item?.name ?? '').toLowerCase())}`,
    pengumuman: (id, kategori) => `/darmasaba/pemerintahan/pengumuman/${kategori}/${id}`,
    sejarahdesa: () => '/darmasaba/pemerintahan/profil',
    visimisidesa: () => '/darmasaba/pemerintahan/profil',
    lambangdesa: () => '/darmasaba/pemerintahan/profil',
    maskotdesa: () => '/darmasaba/pemerintahan/profil',
    profilperbekel: () => '/darmasaba/pemerintahan/profil',
    potensi: () => '/darmasaba/pemerintahan/potensi',
    galleryFoto: () => '/darmasaba/pemerintahan/galery/foto',
    galleryVideo: () => '/darmasaba/pemerintahan/galery/video',
    pelayananSuratKeterangan: () => '/darmasaba/pemerintahan/layanan',
    pelayananPerizinanBerusaha: () => '/darmasaba/pemerintahan/layanan',
    pelayananTelunjukSaktiDesa: () => '/darmasaba/pemerintahan/layanan',
    pelayananPendudukNonPermanen: () => '/darmasaba/pemerintahan/layanan',
    posyandu: (id) => `/darmasaba/kesehatan/posyandu/${id}`,
    fasilitasKesehatan: () => '/darmasaba/kesehatan/data-kesehatan-warga',
    dokterdanTenagaMedis: () => '/darmasaba/kesehatan/data-kesehatan-warga',
    tarifDanLayanan: () => '/darmasaba/kesehatan/data-kesehatan-warga',
    jadwalKegiatan: () => '/darmasaba/kesehatan/data-kesehatan-warga',
    artikelKesehatan: () => '/darmasaba/kesehatan/data-kesehatan-warga',
    puskesmas: () => '/darmasaba/kesehatan/puskesmas',
    programKesehatan: () => '/darmasaba/kesehatan/program-kesehatan',
    penangananDarurat: () => '/darmasaba/kesehatan/penanganan-darurat',
    kontakDarurat: () => '/darmasaba/kesehatan/kontak-darurat',
    infoWabahPenyakit: () => '/darmasaba/kesehatan/info-wabah-penyakit',
    keamananLingkungan: () => '/darmasaba/keamanan/keamanan-lingkungan-pecalang-patwal',
    polsekTerdekat: () => '/darmasaba/keamanan/polsek-terdekat',
    kontakDaruratKeamanan: () => '/darmasaba/keamanan/kontak-darurat',
    pencegahanKriminalitas: () => '/darmasaba/keamanan/pencegahan-kriminalitas',
    laporanPublik: () => '/darmasaba/keamanan/laporan-publik',
    tipsKeamanan: () => '/darmasaba/keamanan/tips-keamanan',
    pasarDesa: (id) => `/darmasaba/ekonomi/umkm/produk/${id}`,
    lowonganKerjaLokal: () => '/darmasaba/ekonomi/lowongan-kerja-lokal',
    strukturOrganisasi: () => '/darmasaba/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes',
    jumlahPendudukUsiaKerjaYangMenganggurUsia: () => '/darmasaba/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur',
    jumlahPendudukUsiaKerjaYangMenganggurPendidikan: () => '/darmasaba/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur',
    jumlahPendudukMiskin: () => '/darmasaba/ekonomi/jumlah-penduduk-miskin',
    programKemiskinan: () => '/darmasaba/ekonomi/program-kemiskinan',
    sektorUnggulanDesa: () => '/darmasaba/ekonomi/sektor-unggulan-desa',
    demografiPekerjaan: () => '/darmasaba/ekonomi/demografi-pekerjaan',
    desaDigital: () => '/darmasaba/inovasi/desa-digital-smart-village',
    programKreatif: () => '/darmasaba/inovasi/program-kreatif-desa',
    kolaborasiInovasi: () => '/darmasaba/inovasi/kolaborasi-inovasi',
    mitraKolaborasi: () => '/darmasaba/inovasi/kolaborasi-inovasi',
    infoTekno: () => '/darmasaba/inovasi/info-teknologi-tepat-guna',
    pengelolaanSampah: () => '/darmasaba/lingkungan/pengelolaan-sampah-bank-sampah',
    keteranganBankSampahTerdekat: () => '/darmasaba/lingkungan/pengelolaan-sampah-bank-sampah',
    programPenghijauan: () => '/darmasaba/lingkungan/program-penghijauan',
    dataLingkunganDesa: () => '/darmasaba/lingkungan/data-lingkungan-desa',
    gotongRoyong: (id, kategori) => `/darmasaba/lingkungan/gotong-royong/${kategori}/${id}`,
    tujuanEdukasiLingkungan: () => '/darmasaba/lingkungan/edukasi-lingkungan',
    materiEdukasiLingkungan: () => '/darmasaba/lingkungan/edukasi-lingkungan',
    contohEdukasiLingkungan: () => '/darmasaba/lingkungan/edukasi-lingkungan',
    filosofiTriHita: () => '/darmasaba/lingkungan/konservasi-adat-bali',
    bentukKonservasiBerdasarkanAdat: () => '/darmasaba/lingkungan/konservasi-adat-bali',
    nilaiKonservasiAdat: () => '/darmasaba/lingkungan/konservasi-adat-bali',
    jenjangPendidikan: () => '/darmasaba/pendidikan/info-sekolah/semua',
    lembaga: () => '/darmasaba/pendidikan/info-sekolah/semua/lembaga',
    siswa: () => '/darmasaba/pendidikan/info-sekolah/semua/siswa',
    pengajar: () => '/darmasaba/pendidikan/info-sekolah/semua/pengajar',
    keunggulanProgram: () => '/darmasaba/pendidikan/beasiswa-desa',
    tujuanProgram: () => '/darmasaba/pendidikan/program-pendidikan-anak',
    programUnggulan: () => '/darmasaba/pendidikan/program-pendidikan-anak',
    lokasiJadwalBimbinganBelajarDesa: () => '/darmasaba/pendidikan/bimbingan-belajar-desa',
    fasilitasBimbinganBelajarDesa: () => '/darmasaba/pendidikan/bimbingan-belajar-desa',
    tujuanPendidikanNonFormal: () => '/darmasaba/pendidikan/pendidikan-non-formal',
    tempatKegiatan: () => '/darmasaba/pendidikan/pendidikan-non-formal',
    jenisProgramYangDiselenggarakan: () => '/darmasaba/pendidikan/pendidikan-non-formal',
    dataPerpustakaan: () => '/darmasaba/pendidikan/perpustakaan-digital/semua',
    dataPendidikan: () => '/darmasaba/pendidikan/data-pendidikan',

  };

  if (type && map[type]) return map[type](id, kategori as string | undefined, item);
  return '/darmasaba';
};

/** Normalisasi `type` hasil pencarian sebelum lookup peta: hanya trim, huruf tidak diubah (kunci peta camelCase). */
export const normalizeSearchType = (type: unknown) => String(type ?? '').trim();

export default getDetailUrl;
