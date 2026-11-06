import { PRESTASI_LIST_HREF } from "./prestasi.meta";

/** Bentuk minimal item dari API prestasi desa yang dipakai section beranda. */
export type PrestasiApiItem = {
  id: string;
  name: string;
  image?: { link?: string | null } | null;
};

/** Data satu kartu grid prestasi di beranda. */
export type PrestasiCard = {
  id: string;
  name: string;
  imageUrl?: string;
  href: string;
};

/** Ubah data API (sudah urut terbaru dari backend) menjadi maksimal `limit` kartu. */
export function toPrestasiCards(data: readonly PrestasiApiItem[] | null | undefined, limit: number): PrestasiCard[] {
  return (data ?? []).slice(0, limit).map((item) => ({
    id: item.id,
    name: item.name.trim(),
    imageUrl: item.image?.link || undefined,
    href: `${PRESTASI_LIST_HREF}/${item.id}`,
  }));
}

/** Kartu terakhir dari jumlah ganjil melebar 2 kolom supaya grid 2 kolom tidak bolong. */
export function isWideCard(index: number, count: number): boolean {
  return count % 2 === 1 && index === count - 1;
}
