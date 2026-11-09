import { PENGHARGAAN_KATEGORI_NAME, PRESTASI_LIST_HREF } from "./prestasi.meta";

/** Jenis entri: penghargaan (kategori "Penghargaan") atau prestasi kategori lain. Satu tabel PrestasiDesa. */
export type PrestasiSource = "prestasi" | "penghargaan";

/** Bentuk minimal item dari endpoint find-many prestasi desa. */
export type PrestasiApiItem = {
  id: string;
  name: string;
  createdAt: string | Date;
  image?: { link?: string | null } | null;
  kategori?: { name?: string | null } | null;
  /** Capaian/peringkat; hanya tampil di halaman detail, bukan di kartu. */
  juara?: string | null;
};

/** Item yang ditampilkan sebagai satu kartu. */
export type PrestasiItem = {
  id: string;
  source: PrestasiSource;
  name: string;
  imageUrl?: string;
  /** Epoch ms — kunci urutan "terbaru". */
  createdAt: number;
  href: string;
};

function sourceOf(item: PrestasiApiItem): PrestasiSource {
  const kategori = item.kategori?.name?.trim().toLowerCase();
  return kategori === PENGHARGAAN_KATEGORI_NAME.toLowerCase() ? "penghargaan" : "prestasi";
}

/** Normalisasi item API ke bentuk kartu; semua entri (termasuk eks-penghargaan) ke detail prestasi. */
export function toPrestasiItem(item: PrestasiApiItem): PrestasiItem {
  return {
    id: item.id,
    source: sourceOf(item),
    name: item.name.trim(),
    imageUrl: item.image?.link || undefined,
    createdAt: new Date(item.createdAt).getTime(),
    href: `${PRESTASI_LIST_HREF}/${item.id}`,
  };
}

/** Nomor halaman aman untuk API (bilangan bulat ≥ 1). */
export function safePage(page: number): number {
  return Math.max(1, Math.floor(page) || 1);
}

/** Jumlah halaman minimal 1 (Pagination butuh total ≥ 1). */
export function countPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** Kartu terakhir dari jumlah ganjil melebar 2 kolom supaya grid 2 kolom tidak bolong. */
export function isWideCard(index: number, count: number): boolean {
  return count % 2 === 1 && index === count - 1;
}
