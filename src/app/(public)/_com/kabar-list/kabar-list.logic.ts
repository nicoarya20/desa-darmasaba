/** Helper murni halaman daftar Kabar (Berita, Pengumuman): nomor halaman & query URL. */

/** Nomor halaman dari query `?page`; selain bilangan bulat positif → 1. */
export function parsePage(raw: string | null | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/** Tambah `?search=&page=` ke path daftar; `search` kosong dan halaman 1 tidak ditulis. */
export function withListQuery(path: string, opts: { search?: string; page?: number } = {}): string {
  const params = new URLSearchParams();
  const search = opts.search?.trim();
  if (search) params.set("search", search);
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
