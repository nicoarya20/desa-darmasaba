import { paginate, withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { htmlToText } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { DESA_DIGITAL_BASE_HREF } from "./desa-digital.meta";

/** Bentuk minimal item desa digital (`/api/inovasi/desadigital/find-many` dan `/:id`). */
export type DesaDigitalApiItem = {
  id: string;
  name: string;
  /** HTML editor admin (isi detail; ringkasan kartu diambil dari sini). */
  deskripsi?: string | null;
  createdAt: string | Date;
  image?: { link?: string | null } | null;
};

/** Satu layanan siap tampil di daftar (sorotan atau kartu). Tanpa tanggal: createdAt = tanggal input admin. */
export type DesaDigitalItem = {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  href: string;
};

/** URL detail `/inovasi/desa-digital-smart-village/{id}`. */
export function desaDigitalDetailHref(id: string): string {
  return `${DESA_DIGITAL_BASE_HREF}/${encodeURIComponent(id)}`;
}

/** URL daftar; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function desaDigitalListHref(opts: { search?: string; page?: number } = {}): string {
  return withListQuery(DESA_DIGITAL_BASE_HREF, opts);
}

export function toDesaDigitalItem(item: DesaDigitalApiItem): DesaDigitalItem {
  return {
    id: item.id,
    title: item.name.trim(),
    summary: htmlToText(item.deskripsi),
    imageUrl: item.image?.link || undefined,
    href: desaDigitalDetailHref(item.id),
  };
}

export type DesaDigitalView = { sorotan?: DesaDigitalItem; cards: DesaDigitalItem[]; page: number; totalPages: number };

/**
 * Susun halaman daftar (pola sama dengan `arrangePencegahan`): tanpa kata kunci, entri pertama (terbaru) jadi sorotan
 * halaman 1 dan dikeluarkan dari kartu di semua halaman; dengan kata kunci semua hasil jadi kartu. Halaman di luar
 * jangkauan → halaman terakhir.
 */
export function arrangeDesaDigital(
  items: readonly DesaDigitalItem[],
  opts: { search: string; page: number; size: number },
): DesaDigitalView {
  const [first, ...rest] = items;
  const withSorotan = !opts.search && first !== undefined;
  const current = paginate(withSorotan ? rest : items, opts.page, opts.size);
  return {
    sorotan: withSorotan && current.page === 1 ? first : undefined,
    cards: current.items,
    page: current.page,
    totalPages: current.totalPages,
  };
}
