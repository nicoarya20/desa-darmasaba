// Logika murni (tanpa I/O) untuk paginasi list struktur organisasi.

/** Batas atas `limit` agar satu request tidak menarik seluruh tabel. */
export const MAX_PAGE_LIMIT = 100;
/** Ukuran halaman bawaan bila `limit` tidak dikirim/invalid. */
export const DEFAULT_PAGE_LIMIT = 10;

export type Paging = { page: number; limit: number; skip: number };

/** Ubah query `page`/`limit` menjadi angka aman (page >= 1, 1 <= limit <= MAX_PAGE_LIMIT) beserta `skip`. */
export function parsePaging(query: { page?: unknown; limit?: unknown }): Paging {
  const page = Math.max(1, Math.floor(Number(query.page)) || 1);
  const rawLimit = Math.floor(Number(query.limit)) || DEFAULT_PAGE_LIMIT;
  const limit = Math.min(MAX_PAGE_LIMIT, Math.max(1, rawLimit));
  return { page, limit, skip: (page - 1) * limit };
}

/** Jumlah halaman dari total baris; minimal 1 agar UI paginasi tidak kosong. */
export function totalPagesOf(total: number, limit: number): number {
  return Math.max(1, Math.ceil(total / limit));
}
