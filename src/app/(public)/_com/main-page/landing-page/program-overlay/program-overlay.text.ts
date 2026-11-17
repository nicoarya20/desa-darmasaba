/** Teks overlay detail Program Inovasi di beranda (tanpa em dash). */
export const PROGRAM_OVERLAY_TEXT = {
  eyebrow: "Program Inovasi",
  close: "Tutup detail program",
  fullPage: "Lihat halaman lengkap",
  loading: "Memuat detail program inovasi",
  emptyDescription: "Belum ada deskripsi.",
  unavailable: "Program inovasi ini tidak ditemukan atau belum bisa dimuat.",
  galleryTitle: "Dokumentasi",
  galleryLoading: "Memuat dokumentasi",
  galleryError: "Dokumentasi belum bisa dimuat.",
  back: "Kembali",
  prevPhoto: "Foto sebelumnya",
  nextPhoto: "Foto berikutnya",
  openPhoto: (n: number, total: number) => `Lihat foto dokumentasi ${n} dari ${total}`,
  photoAlt: (name: string, n: number) => `Dokumentasi ${name}, foto ${n}`,
  photoView: (name: string) => `Foto dokumentasi ${name}`,
  counter: (n: number, total: number) => `${n} / ${total}`,
} as const;
