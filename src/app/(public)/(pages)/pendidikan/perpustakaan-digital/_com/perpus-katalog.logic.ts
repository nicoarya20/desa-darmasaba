import { matchesSearch } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-filter.logic';
import { BUKU_LAIN_MAX, PERPUS_BASE_HREF, PERPUS_URUT, type PerpusUrut } from './perpus.meta';
import type { Buku, BukuKategori } from './perpus.types';

/** Logika murni katalog Perpustakaan Digital: slug kategori, pil, saring, urut, URL, dan rel buku lain. */

/** Segmen URL untuk semua kategori. */
export const SEMUA_SLUG = 'semua';

/**
 * Segmen URL kategori = nama huruf kecil, spasi jadi "-" ("Anak Dan Remaja" → "anak-dan-remaja"). Sama dengan
 * tautan lama (layoutTabs), jadi alamat yang sudah tersebar tetap hidup.
 */
export function kategoriSlug(nama: string): string {
  return nama.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Segmen URL mentah → slug baku. Menerima juga bentuk lama tautan detail (`encodeURIComponent(nama)`,
 * mis. "Anak%20Dan%20Remaja"); "%" yang tidak valid dipakai apa adanya.
 */
export function normalizeSlug(raw: string | null | undefined): string {
  const text = raw ?? '';
  let decoded = text;
  try {
    decoded = decodeURIComponent(text);
  } catch {
    // Segmen diketik manual dengan "%" yang tidak valid: cocokkan apa adanya (hasilnya kosong/tidak dikenal).
  }
  return kategoriSlug(decoded) || SEMUA_SLUG;
}

/** Kategori yang punya buku (unik per slug), dengan jumlahnya, urut nama. */
export function kategoriDenganBuku(buku: readonly Buku[]): (BukuKategori & { jumlah: number })[] {
  const map = new Map<string, BukuKategori & { jumlah: number }>();
  for (const item of buku) {
    if (!item.kategori) continue;
    const found = map.get(item.kategori.slug);
    if (found) found.jumlah += 1;
    else map.set(item.kategori.slug, { ...item.kategori, jumlah: 1 });
  }
  return [...map.values()].sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
}

/** Nama kategori untuk slug; slug tak dikenal ditampilkan dengan "-" jadi spasi. */
export function namaKategori(slug: string, buku: readonly Buku[]): string {
  return buku.find((item) => item.kategori?.slug === slug)?.kategori?.nama ?? slug.replace(/-/g, ' ');
}

/** Buku di kategori `slug` (`semua` = semua). */
export function bukuDiKategori(buku: readonly Buku[], slug: string): Buku[] {
  return slug === SEMUA_SLUG ? [...buku] : buku.filter((item) => item.kategori?.slug === slug);
}

/** Setiap kata kunci harus muncul di judul, deskripsi, atau nama kategori. */
export function cariBuku(buku: readonly Buku[], query: string): Buku[] {
  return buku.filter((item) => matchesSearch(query, [item.judul, item.ringkasan, item.kategori?.nama]));
}

/** Urutan tampilan; Terbaru = waktu dibuat menurun, Judul = A–Z (bahasa Indonesia, angka alami). */
export function urutkanBuku(buku: readonly Buku[], urut: PerpusUrut): Buku[] {
  const copy = [...buku];
  if (urut === 'judul') return copy.sort((a, b) => a.judul.localeCompare(b.judul, 'id', { numeric: true }));
  return copy.sort((a, b) => b.dibuat - a.dibuat);
}

/** `?urut=` → pilihan sah; selain itu bawaan (Terbaru). */
export function parseUrut(raw: string | null | undefined): PerpusUrut {
  return PERPUS_URUT.find((u) => u === raw) ?? PERPUS_URUT[0];
}

/** Alamat daftar untuk kategori + kata kunci + urutan; kosong/bawaan tidak ditulis ke query. */
export function perpusListHref(slug: string, opts: { search?: string; urut?: PerpusUrut } = {}): string {
  const params = new URLSearchParams();
  const search = opts.search?.trim();
  if (search) params.set('search', search);
  if (opts.urut && opts.urut !== PERPUS_URUT[0]) params.set('urut', opts.urut);
  const query = params.toString();
  return `${PERPUS_BASE_HREF}/${encodeURIComponent(slug)}${query ? `?${query}` : ''}`;
}

/** Alamat detail buku (segmen kategori hanya penanda; halaman detail membaca id). */
export function bukuHref(buku: Pick<Buku, 'id' | 'kategori'>): string {
  return `${PERPUS_BASE_HREF}/${encodeURIComponent(buku.kategori?.slug ?? SEMUA_SLUG)}/${encodeURIComponent(buku.id)}`;
}

/** Buku lain di kategori yang sama (tanpa buku ini), terbaru dulu, maks `BUKU_LAIN_MAX`. */
export function bukuLainnya(buku: readonly Buku[], current: Pick<Buku, 'id' | 'kategori'>): Buku[] {
  const slug = current.kategori?.slug;
  if (!slug) return [];
  return urutkanBuku(
    buku.filter((item) => item.id !== current.id && item.kategori?.slug === slug),
    'terbaru',
  ).slice(0, BUKU_LAIN_MAX);
}

/** Satu pil kategori di kepala daftar (bentuk `KabarListTab`). */
export type PerpusTab = { key: string; href: string; label: string; active: boolean };

/**
 * Pil "Semua" + kategori yang punya buku. Kategori aktif dari URL yang tidak punya buku (tautan lama/kategori
 * kosong) tetap dimunculkan sebagai pil aktif supaya pengunjung tahu sedang di mana. Pil mempertahankan cari & urut.
 */
export function perpusTabs(
  buku: readonly Buku[],
  slug: string,
  opts: { search?: string; urut?: PerpusUrut; semuaLabel: string },
): PerpusTab[] {
  const items = [
    { slug: SEMUA_SLUG, label: opts.semuaLabel },
    ...kategoriDenganBuku(buku).map((k) => ({ slug: k.slug, label: k.nama })),
  ];
  if (!items.some((item) => item.slug === slug)) items.push({ slug, label: namaKategori(slug, buku) });
  return items.map((item) => ({
    key: item.slug,
    label: item.label,
    href: perpusListHref(item.slug, { search: opts.search, urut: opts.urut }),
    active: item.slug === slug,
  }));
}

/** Isi daftar untuk kategori + kata kunci + urutan, plus jumlah buku di kategori sebelum dicari. */
export function daftarBuku(
  buku: readonly Buku[],
  slug: string,
  search: string,
  urut: PerpusUrut,
): { items: Buku[]; diKategori: number } {
  const kategori = bukuDiKategori(buku, slug);
  return { items: urutkanBuku(cariBuku(kategori, search), urut), diKategori: kategori.length };
}
