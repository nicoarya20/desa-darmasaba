/** Logika murni urutan daftar anak (galeri foto, pengurus) yang dipakai bersama semua domain. */

/** Nilai `urutan` untuk `jumlah` item baru: lanjut setelah urutan terbesar (null = daftar kosong). */
export function urutanBaru(maxUrutan: number | null, jumlah: number): number[] {
  const mulai = (maxUrutan ?? -1) + 1;
  return Array.from({ length: jumlah }, (_, i) => mulai + i);
}

/**
 * Validasi daftar id reorder terhadap item aktif: harus memuat persis semua item aktif.
 * Mengembalikan pesan error, atau null bila valid. Daftar parsial ditolak agar dua item
 * tidak berakhir dengan urutan yang sama. `label` = sebutan item di pesan (mis. "foto").
 */
export function cekUrutanIds(ids: readonly string[], aktifIds: readonly string[], label = "foto"): string | null {
  const aktif = new Set(aktifIds);
  if (ids.some((id) => !aktif.has(id))) {
    return `Sebagian ${label} tidak ditemukan atau sudah dihapus. Muat ulang halaman lalu coba lagi.`;
  }
  if (ids.length !== aktif.size) {
    return `Daftar ${label} sudah berubah. Muat ulang halaman lalu coba lagi.`;
  }
  return null;
}

/** Pasangan id → urutan sesuai posisi di daftar (index 0 = paling atas). */
export function urutanDariIndex(ids: readonly string[]): { id: string; urutan: number }[] {
  return ids.map((id, urutan) => ({ id, urutan }));
}

/** True bila tidak ada id ganda di daftar. */
export const idListUnik = (ids: readonly string[]) => new Set(ids).size === ids.length;
