/** Helper murni halaman daftar Kabar (Berita, Pengumuman, Kegiatan Desa, …): nomor halaman, paginasi klien & server, query URL, slug kategori, kolom cari. */
import { LIST_SEARCH_THRESHOLD } from "./kabar-list.meta";

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

/** Satu halaman dari daftar yang dipaginasi di klien (Program Kesehatan, Pencegahan Kriminalitas); halaman di luar jangkauan → halaman terakhir. */
export function paginate<T>(items: readonly T[], page: number, size: number): { items: T[]; page: number; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), totalPages);
  return { items: items.slice((current - 1) * size, current * size), page: current, totalPages };
}

/** Keadaan muat satu halaman daftar ber-paginasi server (bentuk minimal yang dibaca `outOfRangePage`). */
export type ServerPageState = { status: "loading" } | { status: "error" } | { status: "ready"; totalPages: number; total: number };

/**
 * Pasangan server untuk `paginate`: `?page` melewati halaman terakhir padahal ada entri (tautan lama, diketik manual)
 * → nomor halaman terakhir yang valid untuk dituju; selain itu `null` (masih memuat/galat, halaman sah, atau memang
 * tidak ada entri sehingga pesan "Belum ada" yang benar).
 */
export function outOfRangePage(state: ServerPageState, page: number): number | null {
  if (state.status !== "ready" || state.total <= 0 || page <= state.totalPages) return null;
  return Math.max(1, state.totalPages);
}

/** Kolom cari tampil bila kata kunci aktif (agar bisa dihapus) atau entri > ambang; jumlah belum diketahui (`null`) tanpa kata kunci → sembunyi. */
export function listSearchable(search: string, total: number | null, threshold = LIST_SEARCH_THRESHOLD): boolean {
  return search !== "" || (total !== null && total > threshold);
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

/**
 * `true` bila `href` hanya mengganti query/hash dari `pathname` (mis. pil `?kategori=`/`?tahun=`); href relatif
 * diselesaikan terhadap `pathname`. Pil seperti itu tidak perlu animasi pindah halaman; `pathname` kosong → `false`.
 */
export function isQueryOnlyHref(pathname: string | null | undefined, href: string): boolean {
  if (!pathname) return false;
  const base = new URL(pathname, "http://kabar.local");
  const target = new URL(href, base);
  return target.origin === base.origin && trimSlash(target.pathname) === trimSlash(base.pathname);
}

function trimSlash(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}
