/** Label UI halaman detail layanan surat keterangan (`/pemerintahan/layanan/{id}`). */
export const LAYANAN_DETAIL_TEXT = {
  kategori: "Layanan Surat Keterangan",
  loading: "Memuat layanan",
  notFound: "Layanan tidak ditemukan atau sudah tidak ditampilkan.",
  backToList: "Lihat semua layanan",
  ajukan: "Ajukan Permohonan",
  alurAlt: (name: string) => `Alur pelayanan ${name}`,
  alurLabel: "Lihat gambar alur pelayanan ukuran penuh",
  closingTitle: "Sudah menyiapkan persyaratan?",
  closingText: "Ajukan permohonan secara online dengan mengisi formulir.",
  waInfo: "Setelah formulir tersimpan, tindak lanjut dilakukan lewat WhatsApp Petugas Layanan Desa.",
  tersimpanTitle: "Permohonan tersimpan",
  tersimpanText:
    "Permohonan Anda sudah kami terima. Lanjutkan lewat WhatsApp ke Petugas Layanan Desa untuk proses selanjutnya.",
  lanjutWa: "Lanjutkan ke WhatsApp",
  tutup: "Tutup",
  waKategoriDefault: "surat keterangan",
  /** Pesan awal WhatsApp: hanya nama & jenis surat, tanpa NIK/nomor KK/alamat (privasi warga). */
  waPesan: (nama: string, kategori: string) =>
    `Halo, saya ${nama} ingin mengajukan ${kategori} melalui website Desa Darmasaba.`,
} as const;
