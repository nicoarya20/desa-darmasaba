import { withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { htmlToText, type KabarItem } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { KEAMANAN_LINGKUNGAN_BASE_HREF } from "./keamanan-lingkungan.meta";

/** Bentuk minimal item keamanan lingkungan (`/api/keamanan/keamananlingkungan/find-many` dan `/:id`). */
export type KeamananLingkunganApiItem = {
  id: string;
  name: string;
  /** HTML editor admin. */
  deskripsi?: string | null;
  createdAt: string | Date;
  image?: { link?: string | null } | null;
};

/** URL detail `/keamanan/keamanan-lingkungan-pecalang-patwal/{id}`. */
export function keamananLingkunganDetailHref(id: string): string {
  return `${KEAMANAN_LINGKUNGAN_BASE_HREF}/${encodeURIComponent(id)}`;
}

/** URL daftar; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function keamananLingkunganListHref(opts: { search?: string; page?: number } = {}): string {
  return withListQuery(KEAMANAN_LINGKUNGAN_BASE_HREF, opts);
}

/** Entri → kartu gaya Berita (tanggal kartu = tanggal entri dibuat; API tidak punya tanggal kegiatan). */
export function toKeamananLingkunganItem(item: KeamananLingkunganApiItem): KabarItem {
  return {
    id: item.id,
    title: item.name.trim(),
    summary: htmlToText(item.deskripsi),
    imageUrl: item.image?.link || undefined,
    createdAt: new Date(item.createdAt).getTime(),
    href: keamananLingkunganDetailHref(item.id),
  };
}

/**
 * HTML editor admin yang benar-benar berisi (teks atau gambar). Editor menyimpan isi kosong sebagai `<p></p>`;
 * isi seperti itu tidak dirender (bukan "-"). Dipakai juga oleh Tips Keamanan.
 */
export function hasHtmlContent(html: string | null | undefined): html is string {
  if (!html) return false;
  return htmlToText(html) !== "" || /<img\b/i.test(html);
}
