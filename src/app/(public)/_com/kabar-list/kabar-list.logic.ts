/** Helper murni halaman daftar Kabar (Berita, Pengumuman, Kegiatan Desa): nomor halaman, query URL, slug kategori. */

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

/** Segmen URL daftar untuk semua kategori (Berita, Kegiatan Desa). */
export const SEMUA_SLUG = "semua";

/** Segmen URL kategori = nama kategori huruf kecil (sama dengan tautan lama `/{halaman}/{nama}`). */
export function kategoriSlug(name: string): string {
  return name.trim().toLowerCase();
}

/** Slug kategori aktif dari pathname daftar (segmen terakhir, huruf kecil); tanpa segmen → `semua`. */
export function activeSlug(pathname: string): string {
  const last = pathname.split("/").filter(Boolean).pop();
  if (!last) return SEMUA_SLUG;
  try {
    return decodeURIComponent(last).toLowerCase();
  } catch {
    // Segmen dengan "%" yang tidak valid (URL diketik manual): pakai apa adanya, filter API case-insensitive.
    return last.toLowerCase();
  }
}

/** Nama kategori untuk ditampilkan; slug yang tak dikenal ditampilkan apa adanya. */
export function kategoriLabel(slug: string, names: readonly string[]): string {
  return names.find((name) => kategoriSlug(name) === slug) ?? slug;
}
