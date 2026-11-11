import { BERITA_BASE_HREF } from "@/app/(public)/_com/main-page/kabar-desa/kabar.meta";
import { SEMUA_SLUG } from "./berita.meta";

/** Segmen URL kategori = nama kategori huruf kecil (sama dengan tautan lama `/berita/{nama}`). */
export function kategoriSlug(name: string): string {
  return name.trim().toLowerCase();
}

/** Nomor halaman dari query `?page`; selain bilangan bulat positif → 1. */
export function parsePage(raw: string | null | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/** URL daftar berita `/berita/{slug}`; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function beritaListHref(slug: string, opts: { search?: string; page?: number } = {}): string {
  const params = new URLSearchParams();
  const search = opts.search?.trim();
  if (search) params.set("search", search);
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  const query = params.toString();
  return `${BERITA_BASE_HREF}/${encodeURIComponent(slug)}${query ? `?${query}` : ""}`;
}

/** Slug kategori aktif dari pathname daftar berita (segmen terakhir, huruf kecil). */
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
