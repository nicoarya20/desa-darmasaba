import { PENGHARGAAN_DETAIL_BASE, PRESTASI_LIST_HREF } from "./prestasi.meta";

/** Asal data: tabel PrestasiDesa atau Penghargaan (dua tabel terpisah sampai backend menyatukannya). */
export type PrestasiSource = "prestasi" | "penghargaan";

/** Bentuk minimal item dari endpoint find-many prestasi desa maupun penghargaan. */
export type PrestasiApiItem = {
  id: string;
  name: string;
  createdAt: string | Date;
  image?: { link?: string | null } | null;
};

/** Item gabungan yang ditampilkan sebagai satu kartu. */
export type PrestasiItem = {
  id: string;
  source: PrestasiSource;
  name: string;
  imageUrl?: string;
  /** Epoch ms — kunci urutan "terbaru" lintas sumber. */
  createdAt: number;
  href: string;
};

const DETAIL_BASE: Record<PrestasiSource, string> = {
  prestasi: PRESTASI_LIST_HREF,
  penghargaan: PENGHARGAAN_DETAIL_BASE,
};

/** Normalisasi item API satu sumber ke bentuk kartu gabungan (href detail sesuai sumbernya). */
export function toPrestasiItem(item: PrestasiApiItem, source: PrestasiSource): PrestasiItem {
  return {
    id: item.id,
    source,
    name: item.name.trim(),
    imageUrl: item.image?.link || undefined,
    createdAt: new Date(item.createdAt).getTime(),
    href: `${DETAIL_BASE[source]}/${item.id}`,
  };
}

/**
 * Halaman `page` dari gabungan beberapa sumber yang masing-masing sudah urut terbaru.
 * Cukup ambil `fetchLimit` teratas tiap sumber: `fetchLimit` teratas gabungan pasti berasal dari situ.
 */
export function pageWindow(page: number, pageSize: number): { fetchLimit: number; offset: number } {
  const safePage = Math.max(1, Math.floor(page));
  return { fetchLimit: safePage * pageSize, offset: (safePage - 1) * pageSize };
}

/** Gabung daftar per sumber, urut terbaru (stabil: urutan sumber dipertahankan bila waktu sama), lalu potong. */
export function mergeNewest(
  lists: readonly (readonly PrestasiItem[])[],
  offset: number,
  size: number,
): PrestasiItem[] {
  return lists
    .flat()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(offset, offset + size);
}

/** Jumlah halaman minimal 1 (Pagination butuh total ≥ 1). */
export function countPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** Kartu terakhir dari jumlah ganjil melebar 2 kolom supaya grid 2 kolom tidak bolong. */
export function isWideCard(index: number, count: number): boolean {
  return count % 2 === 1 && index === count - 1;
}
