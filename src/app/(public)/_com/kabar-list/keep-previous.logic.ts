/** Hasil muat terakhir yang sudah selesai, ditandai kunci query (mis. `halaman|kata kunci`) asalnya. */
export type KeepPreviousSettled<T> = { key: string; status: "ready"; data: T } | { key: string; status: "error" };

/**
 * Keadaan daftar untuk kunci query aktif: `loading` hanya pada muatan pertama (belum ada data sama sekali);
 * `ready` + `refreshing` = data query sebelumnya tetap tampil selama data query baru dimuat.
 */
export type KeepPreviousState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T; refreshing: boolean }
  | { status: "error" };

/**
 * Keadaan tampil dari hasil terakhir untuk kunci `key`. Hasil kunci yang sama apa adanya (data baru, termasuk daftar
 * kosong, atau galat); hasil kunci lain yang sukses dipertahankan sebagai `refreshing`; galat lama tidak dipertahankan
 * (kembali `loading`) agar pesan galat tidak menempel pada query baru.
 */
export function resolveKeepPrevious<T>(settled: KeepPreviousSettled<T> | null, key: string): KeepPreviousState<T> {
  if (!settled) return { status: "loading" };
  if (settled.key === key) return settled.status === "ready" ? { status: "ready", data: settled.data, refreshing: false } : { status: "error" };
  return settled.status === "ready" ? { status: "ready", data: settled.data, refreshing: true } : { status: "loading" };
}

/** Bentuk datar daftar ber-paginasi server: `loading` = kerangka muatan pertama, `refreshing` = daftar lama tetap tampil. */
export type PagedListState<I> = { items: I[]; totalPages: number; loading: boolean; refreshing: boolean; failed: boolean };

/** Ratakan keadaan keep-previous satu halaman daftar; selain `ready` daftar kosong dengan 1 halaman. */
export function toPagedListState<I>(state: KeepPreviousState<{ items: I[]; totalPages: number }>): PagedListState<I> {
  if (state.status !== "ready") {
    return { items: [], totalPages: 1, loading: state.status === "loading", refreshing: false, failed: state.status === "error" };
  }
  return { items: state.data.items, totalPages: state.data.totalPages, loading: false, refreshing: state.refreshing, failed: false };
}
