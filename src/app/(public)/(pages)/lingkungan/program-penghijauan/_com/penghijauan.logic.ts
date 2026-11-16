import { withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import type { ProgramTileItem } from "@/app/(public)/_com/program-tiles/ProgramTiles";
import { isIconKey } from "@/app/admin/(dashboard)/_com/iconMap";
import { htmlToPlainText, sanitizeRichText } from "@/lib/rich-text";
import { PENGHIJAUAN_BASE_HREF } from "./penghijauan.meta";
import { PENGHIJAUAN_TEXT as T } from "./penghijauan.text";

/** Bentuk minimal item `/api/lingkungan/programpenghijauan/find-many` dan `/:id` (urut `createdAt` terbaru). */
export type PenghijauanApiItem = {
  id: string;
  /** Nama program (judul ubin & `h1` detail). */
  name: string;
  /** Kalimat judul dari admin, tampil sebagai ringkasan ubin & pengantar detail. */
  judul?: string | null;
  /** HTML editor admin (isi detail). */
  deskripsi?: string | null;
  /** Kunci ikon `IconMapper` (admin `_com/iconMap`). */
  icon?: string | null;
};

/** Satu program siap tampil sebagai ubin + teks gabungan huruf kecil untuk cari di klien. */
export type Penghijauan = ProgramTileItem & { searchText: string };

/** Isi detail siap tampil; bagian kosong tidak ada (tanpa placeholder). */
export type PenghijauanDetail = { title: string; lead?: string; html?: string };

/** URL detail `/lingkungan/program-penghijauan/{id}` (juga dipakai hasil cari global). */
export function penghijauanDetailHref(id: string): string {
  return `${PENGHIJAUAN_BASE_HREF}/${encodeURIComponent(id)}`;
}

/** URL daftar; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function penghijauanListHref(opts: { search?: string; page?: number } = {}): string {
  return withListQuery(PENGHIJAUAN_BASE_HREF, opts);
}

export function toPenghijauan(item: PenghijauanApiItem): Penghijauan {
  const title = item.name.trim();
  const summary = item.judul?.trim() ?? "";
  const icon = item.icon?.trim() ?? "";
  return {
    id: item.id,
    title,
    summary,
    // Kunci tak dikenal (IconMapper akan menggambar tanda tanya) → ubin tanpa ikon.
    icon: isIconKey(icon) ? icon : undefined,
    href: penghijauanDetailHref(item.id),
    searchText: [title, summary, htmlToPlainText(item.deskripsi)].filter(Boolean).join(" ").toLowerCase(),
  };
}

export function toPenghijauanDetail(
  item: PenghijauanApiItem,
  sanitize: (html: string) => string = sanitizeRichText,
): PenghijauanDetail {
  const lead = item.judul?.trim();
  const html = item.deskripsi ? sanitize(item.deskripsi) : "";
  return { title: item.name.trim(), lead: lead || undefined, html: html || undefined };
}

/** Saring di klien: semua kata kunci harus muncul di nama, judul, atau deskripsi (tidak peka huruf besar). */
export function filterPenghijauan(items: readonly Penghijauan[], search: string): Penghijauan[] {
  const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) => words.every((word) => item.searchText.includes(word)));
}

/** Pesan daftar kosong: bedakan galat, cari tanpa hasil, dan belum ada program. */
export function penghijauanEmptyMessage(search: string, failed: boolean): string {
  if (failed) return T.error;
  const query = search.trim();
  return query ? T.emptySearch(query) : T.empty;
}

/**
 * Pesan API detail berarti "tidak ditemukan". MITIGASI SEMENTARA: `GET /api/lingkungan/programpenghijauan/:id`
 * membalas HTTP 200 + `success:false` (bukan 404) untuk id yang tidak ada, sama bentuknya dengan galat server;
 * pembedanya hanya pesan. Hapus bila API membalas 404 (dicatat untuk backend, /tmp/lingkungan/ce-backend.md).
 */
export function isNotFoundMessage(message: string | null | undefined): boolean {
  return /tidak ditemukan/i.test(message ?? "");
}
