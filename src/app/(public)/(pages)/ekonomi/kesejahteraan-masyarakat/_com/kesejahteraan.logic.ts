import { paginate, withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { externalVideoHref, youtubeId } from "@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/pencegahan.logic";
import { htmlToPlainText, sanitizeRichText } from "@/lib/rich-text";
import { KESEJAHTERAAN_BASE_HREF } from "./kesejahteraan.meta";
import { KESEJAHTERAAN_TEXT as T } from "./kesejahteraan.text";

type ApiImage = { id?: string; link?: string | null; realName?: string | null };

/** Bentuk minimal item `/api/ekonomi/kesejahteraanmasyarakat/find-many` dan `/:id` (urut `createdAt` terbaru). */
export type KesejahteraanApiItem = {
  id: string;
  judul: string;
  /** HTML editor admin: ringkasan kartu & pengantar detail. */
  deskripsi?: string | null;
  /** HTML editor admin: isi detail. */
  content?: string | null;
  /** Tautan video dari admin (biasanya embed YouTube); hanya dipakai lewat fasad/validasi. */
  linkVideo?: string | null;
  image?: ApiImage | null;
  /** Galeri foto (hanya dikirim endpoint detail). */
  images?: ApiImage[] | null;
};

/** Satu program siap tampil di daftar (sorotan atau kartu). Tanpa tanggal: createdAt = tanggal input admin. */
export type KesejahteraanItem = {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  href: string;
  /** Judul + ringkasan + isi, huruf kecil, untuk cari di klien. */
  searchText: string;
};

/** Isi detail siap tampil; bagian kosong tidak ada (tanpa placeholder). */
export type KesejahteraanDetail = {
  title: string;
  /** Pengantar (HTML `deskripsi` yang sudah disanitasi). */
  leadHtml?: string;
  /** Isi (HTML `content` yang sudah disanitasi). */
  html?: string;
  imageUrl?: string;
  galeri: { id: string; link: string; realName?: string | null }[];
  videoId?: string;
  /** URL http(s) non-YouTube → tautan "Buka video di tab baru" (bukan iframe). */
  videoHref?: string;
};

/** URL detail `/ekonomi/kesejahteraan-masyarakat/{id}` (juga dipakai Jenna). */
export function kesejahteraanDetailHref(id: string): string {
  return `${KESEJAHTERAAN_BASE_HREF}/${encodeURIComponent(id)}`;
}

/** URL daftar; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function kesejahteraanListHref(opts: { search?: string; page?: number } = {}): string {
  return withListQuery(KESEJAHTERAAN_BASE_HREF, opts);
}

export function toKesejahteraanItem(item: KesejahteraanApiItem): KesejahteraanItem {
  const title = item.judul.trim();
  const summary = htmlToPlainText(item.deskripsi);
  return {
    id: item.id,
    title,
    summary,
    imageUrl: item.image?.link || undefined,
    href: kesejahteraanDetailHref(item.id),
    searchText: [title, summary, htmlToPlainText(item.content)].filter(Boolean).join(" ").toLowerCase(),
  };
}

/** Saring di klien: semua kata kunci harus muncul di judul, ringkasan, atau isi (tidak peka huruf besar). */
export function filterKesejahteraan(items: readonly KesejahteraanItem[], search: string): KesejahteraanItem[] {
  const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) => words.every((word) => item.searchText.includes(word)));
}

export type KesejahteraanView = { sorotan?: KesejahteraanItem; cards: KesejahteraanItem[]; page: number; totalPages: number };

/**
 * Susun halaman daftar (pola `arrangeDesaDigital`): tanpa kata kunci, entri pertama (terbaru) jadi sorotan halaman 1
 * dan dikeluarkan dari kartu di semua halaman (tidak tampil dua kali); dengan kata kunci semua hasil jadi kartu.
 * Halaman di luar jangkauan → halaman terakhir.
 */
export function arrangeKesejahteraan(
  items: readonly KesejahteraanItem[],
  opts: { search: string; page: number; size: number },
): KesejahteraanView {
  const matches = filterKesejahteraan(items, opts.search);
  const withSorotan = !opts.search.trim() && matches.length > 0;
  const [first, ...rest] = matches;
  const current = paginate(withSorotan ? rest : matches, opts.page, opts.size);
  return {
    sorotan: withSorotan && current.page === 1 ? first : undefined,
    cards: current.items,
    page: current.page,
    totalPages: current.totalPages,
  };
}

/** Pesan daftar kosong: bedakan galat, cari tanpa hasil, dan belum ada program. */
export function kesejahteraanEmptyMessage(search: string, failed: boolean): string {
  if (failed) return T.error;
  const query = search.trim();
  return query ? T.emptySearch(query) : T.empty;
}

/** Data API → isi detail. `sanitize` bisa diganti di test (DOMPurify butuh DOM). */
export function toKesejahteraanDetail(
  item: KesejahteraanApiItem,
  sanitize: (html: string) => string = sanitizeRichText,
): KesejahteraanDetail {
  const leadHtml = item.deskripsi ? sanitize(item.deskripsi) : "";
  const html = item.content ? sanitize(item.content) : "";
  const galeri = (item.images ?? []).flatMap((img) =>
    img.id && img.link ? [{ id: img.id, link: img.link, realName: img.realName }] : [],
  );
  return {
    title: item.judul.trim(),
    leadHtml: leadHtml || undefined,
    html: html || undefined,
    imageUrl: item.image?.link || undefined,
    galeri,
    videoId: youtubeId(item.linkVideo) ?? undefined,
    videoHref: externalVideoHref(item.linkVideo) ?? undefined,
  };
}
