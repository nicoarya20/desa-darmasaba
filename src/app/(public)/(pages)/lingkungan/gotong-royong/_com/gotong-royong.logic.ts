import { detailHref, type KabarItem } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { kategoriSlug, withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { GOTONG_ROYONG_BASE_HREF, GOTONG_ROYONG_FALLBACK_SLUG } from "./gotong-royong.meta";

/** URL daftar `/lingkungan/gotong-royong`; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function gotongRoyongListHref(opts: { search?: string; page?: number } = {}): string {
  return withListQuery(GOTONG_ROYONG_BASE_HREF, opts);
}

/** URL detail `/lingkungan/gotong-royong/{kategori huruf kecil}/{id}`; kategori kosong → `gotong-royong` (segmen kosmetik). */
export function gotongRoyongDetailHref(kategori: string | null | undefined, id: string | number): string {
  const nama = kategori?.trim();
  return detailHref(GOTONG_ROYONG_BASE_HREF, nama ? kategoriSlug(nama) : GOTONG_ROYONG_FALLBACK_SLUG, String(id));
}

/**
 * Kegiatan berkategori Gotong Royong (sudah disaring API per id kategori) → daftar Gotong Royong:
 * tanpa duplikat id, tanggal pelaksanaan terbaru dulu, tautan ke detail Gotong Royong.
 */
export function toGotongRoyongItems(items: readonly KabarItem[]): KabarItem[] {
  const byId = new Map<string, KabarItem>();
  for (const item of items) {
    if (!byId.has(item.id)) {
      byId.set(item.id, { ...item, href: gotongRoyongDetailHref(item.kategori, item.id) });
    }
  }
  return [...byId.values()].sort((a, b) => b.createdAt - a.createdAt);
}

/** Saring kata kunci di klien (judul, ringkasan, kategori; tanpa beda huruf besar); kata kunci kosong → semua. */
export function searchGotongRoyong(items: readonly KabarItem[], search: string): KabarItem[] {
  const query = search.trim().toLocaleLowerCase("id-ID");
  if (!query) return [...items];
  return items.filter((item) =>
    [item.title, item.summary, item.kategori ?? ""].some((text) => text.toLocaleLowerCase("id-ID").includes(query)),
  );
}
