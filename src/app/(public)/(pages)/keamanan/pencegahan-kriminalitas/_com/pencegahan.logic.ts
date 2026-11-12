import { paginate, withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { htmlToText } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { PENCEGAHAN_BASE_HREF, YOUTUBE_EMBED_BASE, YOUTUBE_THUMB_BASE } from "./pencegahan.meta";

/** Bentuk minimal item pencegahan kriminalitas (`/api/keamanan/pencegahankriminalitas/find-many` dan `/:id`). */
export type PencegahanApiItem = {
  id: string;
  judul: string;
  /** HTML editor admin. */
  deskripsiSingkat?: string | null;
  /** HTML editor admin (isi detail). */
  deskripsi?: string | null;
  /** URL YouTube dari admin (umumnya sudah `/embed/{id}`, data lama `watch?v=`). */
  linkVideo?: string | null;
  createdAt: string | Date;
};

/** Satu program siap tampil di daftar (sorotan atau kartu). */
export type PencegahanItem = {
  id: string;
  title: string;
  summary: string;
  /** ID video YouTube yang valid; tidak ada → tampil tanpa video. */
  videoId?: string;
  /** Epoch ms. */
  createdAt: number;
  href: string;
};

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(["youtube.com", "youtube-nocookie.com"]);
const YOUTUBE_PATH_KINDS = new Set(["embed", "shorts", "live", "v"]);

/**
 * ID video dari URL YouTube: `watch?v=`, `youtu.be/{id}`, `/embed/{id}`, `/shorts/{id}`, `/live/{id}` (juga www/m/
 * youtube-nocookie). Selain itu, atau ID tidak berbentuk 11 karakter YouTube → `null`.
 */
export function youtubeId(raw: string | null | undefined): string | null {
  const url = parseHttpUrl(raw);
  if (!url) return null;
  const host = url.hostname.toLowerCase().replace(/^(www|m|music)\./, "");
  const [, first = "", second = ""] = url.pathname.split("/");
  let id: string | null = null;
  if (host === "youtu.be") id = first;
  else if (YOUTUBE_HOSTS.has(host)) {
    if (first === "watch") id = url.searchParams.get("v");
    else if (YOUTUBE_PATH_KINDS.has(first)) id = second;
  }
  return id && YOUTUBE_ID.test(id) ? id : null;
}

/** URL http(s) yang bukan video YouTube (tautan "buka video" di detail); YouTube/tidak valid → `null`. */
export function externalVideoHref(raw: string | null | undefined): string | null {
  const url = parseHttpUrl(raw);
  return url && !youtubeId(raw) ? url.href : null;
}

function parseHttpUrl(raw: string | null | undefined): URL | null {
  if (!raw?.trim()) return null;
  try {
    const url = new URL(raw.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    // Teks bebas dari admin (bukan URL): diperlakukan sebagai "tanpa video", bukan galat.
    return null;
  }
}

export function youtubeThumbUrl(id: string): string {
  return `${YOUTUBE_THUMB_BASE}/${id}/hqdefault.jpg`;
}

/** Pemutar tersemat; diputar otomatis karena baru dimuat setelah pengguna menekan tombol putar. */
export function youtubeEmbedUrl(id: string): string {
  return `${YOUTUBE_EMBED_BASE}/${id}?autoplay=1&rel=0&playsinline=1`;
}

/** URL detail `/keamanan/pencegahan-kriminalitas/{id}`. */
export function pencegahanDetailHref(id: string): string {
  return `${PENCEGAHAN_BASE_HREF}/${encodeURIComponent(id)}`;
}

/** URL daftar; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function pencegahanListHref(opts: { search?: string; page?: number } = {}): string {
  return withListQuery(PENCEGAHAN_BASE_HREF, opts);
}

export function toPencegahanItem(item: PencegahanApiItem): PencegahanItem {
  return {
    id: item.id,
    title: item.judul.trim(),
    summary: htmlToText(item.deskripsiSingkat),
    videoId: youtubeId(item.linkVideo) ?? undefined,
    createdAt: new Date(item.createdAt).getTime(),
    href: pencegahanDetailHref(item.id),
  };
}

export type PencegahanView = { sorotan?: PencegahanItem; cards: PencegahanItem[]; page: number; totalPages: number };

/**
 * Susun halaman daftar. Tanpa kata kunci: entri pertama (terbaru, urutan API) jadi sorotan dan **dikeluarkan dari
 * kartu di semua halaman**, jadi tidak pernah tampil dobel dan paginasi menghitung sisanya; sorotan hanya tampil di
 * halaman 1. Dengan kata kunci: tanpa sorotan, semua hasil jadi kartu. Halaman di luar jangkauan → halaman terakhir.
 */
export function arrangePencegahan(
  items: readonly PencegahanItem[],
  opts: { search: string; page: number; size: number },
): PencegahanView {
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
