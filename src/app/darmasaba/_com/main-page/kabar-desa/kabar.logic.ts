import { DESA_TIME_ZONE } from "../apbdes/apbdes.logic";
import { BERITA_BASE_HREF, KABAR_FALLBACK_KATEGORI, PENGUMUMAN_BASE_HREF } from "./kabar.meta";

/** Bentuk minimal item find-many berita (`/api/desa/berita/find-many`). */
export type BeritaApiItem = {
  id: string;
  judul: string;
  deskripsi?: string | null;
  createdAt: string | Date;
  image?: { link?: string | null } | null;
  kategoriBerita?: { name?: string | null } | null;
};

/** Bentuk minimal item find-many pengumuman (`/api/desa/pengumuman/find-many`). */
export type PengumumanApiItem = {
  id: string;
  judul: string;
  createdAt: string | Date;
  CategoryPengumuman?: { name?: string | null } | null;
};

/** Satu entri Kabar Desa siap tampil (berita atau pengumuman). */
export type KabarItem = {
  id: string;
  title: string;
  /** Teks polos dari `deskripsi` HTML (kosong untuk pengumuman). */
  summary: string;
  kategori?: string;
  imageUrl?: string;
  /** Epoch ms. */
  createdAt: number;
  href: string;
};

const ENTITIES: Record<string, string> = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'" };

/** HTML dari editor admin → teks polos satu baris (tag dibuang, entitas umum dibaca). */
export function htmlToText(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<(br|\/p|\/div|\/li|\/h\d)\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(nbsp|amp|lt|gt|quot|#39|apos);/gi, (_, name: string) => ENTITIES[name.toLowerCase()])
    .replace(/\s+/g, " ")
    .trim();
}

/** URL detail: `{base}/{kategori}/{id}`; kategori di-encode, kosong → kategori pengganti. */
export function detailHref(base: string, kategori: string | null | undefined, id: string): string {
  const segment = kategori?.trim() || KABAR_FALLBACK_KATEGORI;
  return `${base}/${encodeURIComponent(segment)}/${id}`;
}

function kategoriName(name: string | null | undefined): string | undefined {
  return name?.trim() || undefined;
}

/** Normalisasi item find-many berita ke entri Kabar Desa. */
export function toBeritaItem(item: BeritaApiItem): KabarItem {
  const kategori = kategoriName(item.kategoriBerita?.name);
  return {
    id: item.id,
    title: item.judul.trim(),
    summary: htmlToText(item.deskripsi),
    kategori,
    imageUrl: item.image?.link || undefined,
    createdAt: new Date(item.createdAt).getTime(),
    href: detailHref(BERITA_BASE_HREF, kategori, item.id),
  };
}

/** Normalisasi item find-many pengumuman ke entri Kabar Desa. */
export function toPengumumanItem(item: PengumumanApiItem): KabarItem {
  const kategori = kategoriName(item.CategoryPengumuman?.name);
  return {
    id: item.id,
    title: item.judul.trim(),
    summary: "",
    kategori,
    createdAt: new Date(item.createdAt).getTime(),
    href: detailHref(PENGUMUMAN_BASE_HREF, kategori, item.id),
  };
}

const shortDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: DESA_TIME_ZONE,
});

/** Tanggal ringkas WITA, mis. `3 Nov 2026`. */
export function formatTanggalKabar(epochMs: number): string {
  return shortDate.format(new Date(epochMs));
}

/** Pisah berita utama (pertama/terbaru) dari sisanya. */
export function splitFeatured<T>(items: readonly T[]): { featured?: T; rest: T[] } {
  const [featured, ...rest] = items;
  return { featured, rest };
}
