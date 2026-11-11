import { withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { PENGUMUMAN_BASE_HREF } from "@/app/(public)/_com/main-page/kabar-desa/kabar.meta";

/** Kategori pengumuman untuk pil: nama + jumlah pengumuman (`_count.pengumumans` dari API kategori). */
export type PengumumanKategori = { name: string; count: number };

/**
 * URL daftar pengumuman: semua = `/pengumuman`, satu kategori = `/pengumuman/{nama}` (nama asli, di-encode;
 * sama dengan tautan lama). `search` kosong dan halaman 1 tidak ditulis ke query.
 */
export function pengumumanListHref(kategori: string, opts: { search?: string; page?: number } = {}): string {
  const path = kategori ? `${PENGUMUMAN_BASE_HREF}/${encodeURIComponent(kategori)}` : PENGUMUMAN_BASE_HREF;
  return withListQuery(path, opts);
}

/** Nama kategori dari pathname daftar (`/pengumuman/{nama}`); halaman semua → ''. */
export function activeKategori(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const base = segments.indexOf("pengumuman");
  const raw = base < 0 ? undefined : segments[base + 1];
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    // Segmen dengan "%" yang tidak valid (URL diketik manual): pakai apa adanya, filter API case-insensitive.
    return raw;
  }
}

/** Nama sama tanpa membedakan huruf besar (filter API juga case-insensitive). */
export function samaKategori(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Kategori yang ditampilkan sebagai pil: yang punya pengumuman, plus kategori aktif walau kosong. */
export function kategoriTerlihat(list: readonly PengumumanKategori[], active: string): PengumumanKategori[] {
  return list.filter((kat) => kat.count > 0 || (active !== "" && samaKategori(kat.name, active)));
}

/** Nama kategori untuk teks (ejaan dari data bila dikenal, selain itu segmen URL apa adanya). */
export function labelKategori(active: string, list: readonly PengumumanKategori[]): string {
  return list.find((kat) => samaKategori(kat.name, active))?.name ?? active;
}
