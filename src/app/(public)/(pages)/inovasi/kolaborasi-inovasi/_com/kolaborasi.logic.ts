import type { KabarListTab } from "@/app/(public)/_com/kabar-list/KabarListHeader";
import { htmlToPlainText, sanitizeRichText } from "@/lib/rich-text";
import { KOLABORASI_BASE_HREF } from "./kolaborasi.meta";
import { KOLABORASI_TEXT as T } from "./kolaborasi.text";

/** Bentuk minimal item `/api/inovasi/kolaborasiinovasi/find-many` (urut `createdAt` terbaru). */
export type KolaborasiApiItem = {
  id: string;
  name: string;
  tahun?: number | string | null;
  /** Kolom "deskripsi singkat" form admin (bukan slug URL). */
  slug?: string | null;
  /** HTML editor admin. */
  deskripsi?: string | null;
  kolaborator?: string | null;
};

/** Satu kolaborasi siap tampil; field opsional tidak ada bila kosong di data (tanpa placeholder). */
export type Kolaborasi = {
  id: string;
  title: string;
  year: number | null;
  summary?: string;
  /** HTML deskripsi yang sudah disaring. */
  html?: string;
  /** Panjang teks polos deskripsi (penentu tombol "Baca selengkapnya"). */
  textLength: number;
  partners?: string;
  /** Teks gabungan huruf kecil untuk cari di klien. */
  searchText: string;
};

/** Query daftar dari URL: `?tahun=` (null = semua), `?search=`, `?page=`. */
export type KolaborasiQuery = { tahun: number | null; search: string; page: number };

export type KolaborasiGroup = { year: number | null; items: Kolaborasi[] };

const KEBAB_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)+$/;

/**
 * Mitigasi sementara: kolom `slug` dipakai form admin sebagai ringkasan, tetapi sebagian entri berisi slug URL sungguhan
 * (stg: "forum-inovasi-desa-tes"). Teks berpola kebab-case tidak layak tampil sebagai kalimat, jadi disembunyikan.
 * Hapus setelah backend memisahkan kolom ringkasan / memvalidasi form (docs/BACKEND-TODO.md, temuan sesi Inovasi 29).
 */
export function isSlugLike(text: string): boolean {
  return KEBAB_SLUG.test(text.trim());
}

/** Tahun valid (bilangan bulat 4 digit) dari data API atau query URL; selain itu null. */
export function parseTahun(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1000 && n <= 9999 ? n : null;
}

export function toKolaborasi(item: KolaborasiApiItem, sanitize: (html: string) => string = sanitizeRichText): Kolaborasi {
  const title = item.name.trim();
  const rawSummary = item.slug?.trim() ?? "";
  const summary = rawSummary && !isSlugLike(rawSummary) ? rawSummary : undefined;
  const plain = htmlToPlainText(item.deskripsi);
  const html = item.deskripsi ? sanitize(item.deskripsi) : "";
  const partners = item.kolaborator?.trim() || undefined;
  return {
    id: item.id,
    title,
    year: parseTahun(item.tahun),
    summary,
    html: html || undefined,
    textLength: plain.length,
    partners,
    searchText: [title, summary, partners, plain].filter(Boolean).join(" ").toLowerCase(),
  };
}

/** Urut tahun terbaru dulu (tanpa tahun di akhir); di dalam tahun yang sama urutan API (terbaru dibuat) dipertahankan. */
export function sortKolaborasi(items: readonly Kolaborasi[]): Kolaborasi[] {
  const rank = (year: number | null) => year ?? Number.MIN_SAFE_INTEGER;
  return [...items].sort((a, b) => rank(b.year) - rank(a.year));
}

/** Saring di klien menurut tahun dan kata kunci (judul, ringkasan, kolaborator, deskripsi; tidak peka huruf besar). */
export function filterKolaborasi(items: readonly Kolaborasi[], query: Pick<KolaborasiQuery, "tahun" | "search">): Kolaborasi[] {
  const words = query.search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter(
    (item) => (query.tahun === null || item.year === query.tahun) && words.every((word) => item.searchText.includes(word)),
  );
}

/** Kelompok tahun berurutan dari satu halaman daftar (tahun yang terpotong paginasi muncul lagi di halaman berikutnya). */
export function groupByYear(items: readonly Kolaborasi[]): KolaborasiGroup[] {
  const groups: KolaborasiGroup[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.year === item.year) last.items.push(item);
    else groups.push({ year: item.year, items: [item] });
  }
  return groups;
}

/** URL daftar; tahun kosong, kata kunci kosong, dan halaman 1 tidak ditulis ke query. */
export function kolaborasiListHref(opts: { tahun?: number | null; search?: string; page?: number } = {}): string {
  const params = new URLSearchParams();
  if (opts.tahun) params.set("tahun", String(opts.tahun));
  const search = opts.search?.trim();
  if (search) params.set("search", search);
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  const query = params.toString();
  return query ? `${KOLABORASI_BASE_HREF}?${query}` : KOLABORASI_BASE_HREF;
}

/**
 * Pil tahun (terbaru dulu, "Semua" di depan). Pil hanya berguna bila ada ≥ 2 tahun; tahun di URL yang tidak ada di data tetap
 * diberi pil agar pengunjung tahu filter apa yang aktif. Tanpa itu → [] (KabarListHeader tidak merender baris pil).
 */
export function tahunTabs(items: readonly Kolaborasi[], query: Pick<KolaborasiQuery, "tahun" | "search">): KabarListTab[] {
  const years = new Set(items.map((item) => item.year).filter((year): year is number => year !== null));
  if (years.size < 2 && query.tahun === null) return [];
  if (query.tahun !== null) years.add(query.tahun);
  const sorted = [...years].sort((a, b) => b - a);
  return [
    { key: "", label: T.allYears, href: kolaborasiListHref({ search: query.search }), active: query.tahun === null },
    ...sorted.map((year) => ({
      key: String(year),
      label: String(year),
      href: kolaborasiListHref({ tahun: year, search: query.search }),
      active: year === query.tahun,
    })),
  ];
}

/** Pesan daftar kosong: bedakan galat, belum ada data, tahun tanpa entri, dan cari tanpa hasil. */
export function emptyMessage(query: Pick<KolaborasiQuery, "tahun" | "search">, failed: boolean): string {
  if (failed) return T.error;
  const search = query.search.trim();
  if (search && query.tahun !== null) return T.emptySearchYear(search, query.tahun);
  if (search) return T.emptySearch(search);
  if (query.tahun !== null) return T.emptyYear(query.tahun);
  return T.empty;
}
