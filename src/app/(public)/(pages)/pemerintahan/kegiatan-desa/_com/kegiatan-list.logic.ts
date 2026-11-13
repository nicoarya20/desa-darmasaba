import { kategoriSlug, withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { detailHref, htmlToText, type KabarItem } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { KEGIATAN_BASE_HREF } from "./kegiatan.meta";

/** Bentuk minimal item find-many kegiatan desa (`/api/desa/kegiatandesa/find-many`). */
export type KegiatanApiItem = {
  id: string;
  judul: string;
  deskripsiSingkat?: string | null;
  /** Tanggal pelaksanaan kegiatan. */
  tanggal: string | Date;
  image?: { link?: string | null } | null;
  kategoriKegiatan?: { nama?: string | null } | null;
};

/** URL daftar kegiatan `/kegiatan-desa/{slug}`; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function kegiatanListHref(slug: string, opts: { search?: string; page?: number } = {}): string {
  return withListQuery(`${KEGIATAN_BASE_HREF}/${encodeURIComponent(slug)}`, opts);
}

/** URL detail `/kegiatan-desa/{kategori huruf kecil}/{id}` (segmen kategori hanya kosmetik). */
export function kegiatanDetailHref(kategori: string | null | undefined, id: string): string {
  const nama = kategori?.trim();
  return detailHref(KEGIATAN_BASE_HREF, nama ? kategoriSlug(nama) : undefined, id);
}

/** Normalisasi item find-many kegiatan ke kartu gaya Berita (tanggal kartu = tanggal pelaksanaan). */
export function toKegiatanItem(item: KegiatanApiItem): KabarItem {
  const kategori = item.kategoriKegiatan?.nama?.trim() || undefined;
  return {
    id: item.id,
    title: item.judul.trim(),
    summary: htmlToText(item.deskripsiSingkat),
    kategori,
    imageUrl: item.image?.link || undefined,
    createdAt: new Date(item.tanggal).getTime(),
    href: kegiatanDetailHref(kategori, item.id),
  };
}
