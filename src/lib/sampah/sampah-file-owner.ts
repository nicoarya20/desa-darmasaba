// Registry pemilik berkas → ID submenu sidebar asal, dipakai saat berkas dipindah ke Sampah
// (`FileStorage.deletedFrom`). Kunci = nama model Prisma pemilik berkas yang dikirim pemanggil
// `removeStoredFile(file, owner)`. ID submenu dikunci contract test sampah_file_owner.test.ts.

/** Nama model pemilik berkas → ID submenu (atau section tanpa submenu, mis. "Musik"). */
export const FILE_OWNER_MENU: Readonly<Record<string, string>> = {
  // Landing Page
  PejabatDesa: "landing-page.profil",
  MediaSosial: "landing-page.profil",
  ProgramInovasi: "landing-page.profil",
  SdgsDesa: "landing-page.sdgs",
  PrestasiDesa: "landing-page.prestasi-desa",
  // PPID
  ProfilePPID: "ppid.profil-ppid",
  PegawaiPPID: "ppid.struktur-ppid",
  // Pemerintahan (Desa)
  ProfilPerbekel: "desa.profil",
  PerbekelDariMasaKeMasa: "desa.profil",
  MaskotDesa: "desa.profil",
  PotensiDesa: "desa.potensi",
  Berita: "desa.berita",
  Pengumuman: "desa.pengumuman",
  GalleryFoto: "desa.gallery",
  PelayananSuratKeterangan: "desa.layanan",
  PerangkatDesa: "desa.struktur-perangkat-desa",
  // Kesehatan
  Posyandu: "kesehatan.posyandu",
  Puskesmas: "kesehatan.puskesmas",
  ProgramKesehatan: "kesehatan.program-kesehatan",
  PenangananDarurat: "kesehatan.penanganan-darurat",
  KontakDarurat: "kesehatan.kontak-darurat",
  InfoWabahPenyakit: "kesehatan.info-wabah-penyakit",
  ArtikelKesehatan: "kesehatan.data-kesehatan-warga",
  // Keamanan
  KeamananLingkungan: "keamanan.keamanan-lingkungan-pecalang-patwal",
  MenuTipsKeamanan: "keamanan.tips-keamanan",
  // Ekonomi
  PegawaiBumDes: "ekonomi.bumdes",
  KesejahteraanMasyarakat: "ekonomi.kesejahteraan-masyarakat",
  // Inovasi
  DesaDigital: "inovasi.desa-digital-smart-village",
  PengaduanMasyarakat: "inovasi.layanan-online-desa",
  MitraKolaborasi: "inovasi.kolaborasi-inovasi",
  InfoTekno: "inovasi.info-teknologi-tepat-guna",
  // Lingkungan
  KegiatanDesa: "lingkungan.gotong-royong",
  // Pendidikan
  DataPerpustakaan: "pendidikan.perpustakaan-digital",
  // Musik (section tanpa submenu)
  MusikDesa: "Musik",
};

/** ID submenu asal untuk pemilik berkas; pemilik tak dikenal → null (kelompok "Lainnya"). */
export function menuIdForOwner(owner: string): string | null {
  return Object.hasOwn(FILE_OWNER_MENU, owner) ? FILE_OWNER_MENU[owner] : null;
}
