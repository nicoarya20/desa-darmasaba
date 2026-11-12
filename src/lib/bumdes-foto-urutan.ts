/** Nilai `urutan` untuk `jumlah` foto baru: lanjut setelah urutan terbesar (null = galeri kosong). */
export function urutanFotoBaru(maxUrutan: number | null, jumlah: number): number[] {
  const mulai = (maxUrutan ?? -1) + 1;
  return Array.from({ length: jumlah }, (_, i) => mulai + i);
}

/**
 * Validasi daftar id reorder terhadap foto galeri aktif: harus memuat persis semua foto aktif.
 * Mengembalikan pesan error, atau null bila valid. Daftar parsial ditolak agar dua foto
 * tidak berakhir dengan urutan yang sama.
 */
export function cekUrutanIds(ids: readonly string[], aktifIds: readonly string[]): string | null {
  const aktif = new Set(aktifIds);
  if (ids.some((id) => !aktif.has(id))) {
    return "Sebagian foto tidak ditemukan atau sudah dihapus. Muat ulang halaman lalu coba lagi.";
  }
  if (ids.length !== aktif.size) {
    return "Daftar foto sudah berubah. Muat ulang halaman lalu coba lagi.";
  }
  return null;
}

/** Pasangan id → urutan sesuai posisi di daftar (index 0 = paling atas). */
export function urutanDariIndex(ids: readonly string[]): { id: string; urutan: number }[] {
  return ids.map((id, urutan) => ({ id, urutan }));
}
