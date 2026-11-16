import { formatJumlah } from "../info-sekolah.logic";

/** Teks halaman detail sekolah publik (Info Sekolah › lembaga). */
export const LEMBAGA_DETAIL_TEXT = {
  pageLabel: "Detail sekolah",
  loading: "Memuat detail sekolah",
  failed: "Detail sekolah belum bisa dimuat. Periksa koneksi lalu coba lagi.",
  notFoundTitle: "Sekolah tidak ditemukan",
  notFoundBody: "Sekolah ini tidak ada atau sudah tidak ditampilkan. Lihat daftar sekolah di halaman Info Sekolah.",
  backToList: "Ke daftar sekolah",
  leadFallback: "Lembaga pendidikan di Desa Darmasaba.",

  profilTitle: "Profil Sekolah",
  infoTitle: "Informasi",
  jenjangLabel: "Jenjang",
  angkaLabel: "Siswa & pengajar",
  angka: (siswa: number, pengajar: number) => `${formatJumlah(siswa)} siswa · ${formatJumlah(pengajar)} pengajar`,
  alamatLabel: "Alamat",
  kontakLabel: "Kontak",
  medsosLabel: "Media sosial",
  lokasiTitle: "Lokasi",
  petaLabel: (nama: string) => `Peta lokasi ${nama}`,
  strukturTitle: "Struktur Organisasi",
  galeriTitle: "Foto Kegiatan",
  galeriLabel: (nama: string) => `Foto kegiatan ${nama}`,
  fotoSekolahAlt: (nama: string) => `Foto ${nama}`,
} as const;
