/** Keadaan tampil daftar berhalaman Kesehatan (Info Wabah, Penanganan Darurat) dari `findMany` state. */
export type DaftarMuat = {
  /** Kerangka penuh: hanya selama muatan pertama (belum pernah ada data). */
  skeleton: boolean;
  /** Memuat ulang (cari/paging): kepala + kolom cari + daftar lama tetap tampil, wadah daftar `aria-busy`. */
  busy: boolean;
};

/**
 * Kerangka hanya saat `data` masih `null`; saat memuat ulang daftar lama ditahan supaya halaman tidak berkedip dan
 * kolom cari tidak kehilangan fokus (state `findMany` tidak mengosongkan `data` ketika `load` berjalan).
 */
export function daftarMuat(data: readonly unknown[] | null | undefined, loading: boolean): DaftarMuat {
  const hasData = data != null;
  return { skeleton: !hasData, busy: hasData && loading };
}
