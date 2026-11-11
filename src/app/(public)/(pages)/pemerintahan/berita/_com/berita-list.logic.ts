import { withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { BERITA_BASE_HREF } from "@/app/(public)/_com/main-page/kabar-desa/kabar.meta";
import { SEMUA_SLUG } from "./berita.meta";

/** Segmen URL kategori = nama kategori huruf kecil (sama dengan tautan lama `/berita/{nama}`). */
export function kategoriSlug(name: string): string {
  return name.trim().toLowerCase();
}

/** URL daftar berita `/berita/{slug}`; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function beritaListHref(slug: string, opts: { search?: string; page?: number } = {}): string {
  return withListQuery(`${BERITA_BASE_HREF}/${encodeURIComponent(slug)}`, opts);
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
