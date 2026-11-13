import { withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { BERITA_BASE_HREF } from "@/app/(public)/_com/main-page/kabar-desa/kabar.meta";

/** URL daftar berita `/berita/{slug}`; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function beritaListHref(slug: string, opts: { search?: string; page?: number } = {}): string {
  return withListQuery(`${BERITA_BASE_HREF}/${encodeURIComponent(slug)}`, opts);
}
