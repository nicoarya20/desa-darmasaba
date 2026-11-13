import {
  KATALOG_BASE_HREF,
  PRODUK_URUT,
  TOKO_URUT,
  type KatalogTab,
  type KatalogUrut,
} from './katalog-filter.meta';

/**
 * Keadaan katalog yang disimpan di URL: `tab`, `q`, `kategori`/`toko` (id dipisah koma), `min`, `max`,
 * `tersedia=1`, `unggulan=1`, `urut`. Saringan khusus produk selalu kosong di tab Toko.
 */
export type KatalogParams = {
  tab: KatalogTab;
  q: string;
  kategori: string[];
  toko: string[];
  min: number | null;
  max: number | null;
  tersedia: boolean;
  unggulan: boolean;
  urut: KatalogUrut;
};

type Reader = { get(name: string): string | null };

const defaultUrut = (tab: KatalogTab): KatalogUrut => (tab === 'toko' ? TOKO_URUT[0] : PRODUK_URUT[0]);

/** Params kosong satu tab (urutan bawaan, tanpa kata kunci & saringan). */
export function emptyParams(tab: KatalogTab, q = ''): KatalogParams {
  return { tab, q, kategori: [], toko: [], min: null, max: null, tersedia: false, unggulan: false, urut: defaultUrut(tab) };
}

/** Daftar id unik dari "a,b,,a" → ["a","b"]. */
function parseIds(raw: string | null): string[] {
  const ids = (raw ?? '').split(',').map((id) => id.trim()).filter(Boolean);
  return [...new Set(ids)];
}

/** Harga bulat ≥ 0 dari teks; selain itu null. */
function parseHargaParam(raw: string | null): number | null {
  if (raw === null || !/^\d{1,12}$/.test(raw.trim())) return null;
  return Number(raw.trim());
}

/** Rentang harga dengan min > maks ditukar. */
export function normalizeRange(min: number | null, max: number | null): { min: number | null; max: number | null } {
  return min !== null && max !== null && min > max ? { min: max, max: min } : { min, max };
}

/** Baca params dari URL; nilai tak dikenal diabaikan (kembali ke bawaan). */
export function parseKatalogParams(search: Reader): KatalogParams {
  const tab: KatalogTab = search.get('tab') === 'toko' ? 'toko' : 'produk';
  const base = emptyParams(tab, search.get('q')?.trim() ?? '');
  const urutList: readonly KatalogUrut[] = tab === 'toko' ? TOKO_URUT : PRODUK_URUT;
  const urut = urutList.find((value) => value === search.get('urut')) ?? base.urut;
  const kategori = parseIds(search.get('kategori'));
  if (tab === 'toko') return { ...base, kategori, urut };
  return {
    ...base,
    kategori,
    urut,
    toko: parseIds(search.get('toko')),
    ...normalizeRange(parseHargaParam(search.get('min')), parseHargaParam(search.get('max'))),
    tersedia: search.get('tersedia') === '1',
    unggulan: search.get('unggulan') === '1',
  };
}

/** URL katalog untuk params; nilai bawaan tidak ditulis. Id digabung koma tanpa di-encode komanya. */
export function katalogHref(p: KatalogParams): string {
  const parts: string[] = [];
  const add = (name: string, value: string) => parts.push(`${name}=${value}`);
  if (p.tab !== 'produk') add('tab', p.tab);
  if (p.q) add('q', encodeURIComponent(p.q));
  if (p.kategori.length) add('kategori', p.kategori.map(encodeURIComponent).join(','));
  if (p.tab === 'produk') {
    if (p.toko.length) add('toko', p.toko.map(encodeURIComponent).join(','));
    if (p.min !== null) add('min', String(p.min));
    if (p.max !== null) add('max', String(p.max));
    if (p.tersedia) add('tersedia', '1');
    if (p.unggulan) add('unggulan', '1');
  }
  if (p.urut !== defaultUrut(p.tab)) add('urut', p.urut);
  return parts.length ? `${KATALOG_BASE_HREF}?${parts.join('&')}` : KATALOG_BASE_HREF;
}

/** Pindah tab: kata kunci dipertahankan, saringan & urutan tab lain dibuang (tab yang sama → tetap). */
export function switchTab(p: KatalogParams, tab: KatalogTab): KatalogParams {
  return tab === p.tab ? p : emptyParams(tab, p.q);
}

/** "Hapus semua" saringan: tab, kata kunci, dan urutan tetap. */
export function clearFilters(p: KatalogParams): KatalogParams {
  return { ...emptyParams(p.tab, p.q), urut: p.urut };
}

/** Banyak saringan aktif (tiap kategori/toko dihitung satu; rentang harga satu). */
export function countActiveFilters(p: KatalogParams): number {
  const harga = p.min !== null || p.max !== null ? 1 : 0;
  return p.kategori.length + p.toko.length + harga + Number(p.tersedia) + Number(p.unggulan);
}

/** Isian harga → angka (hanya digit yang dibaca, mis. "Rp10.000" → 10000); kosong → null. */
export function parseHargaInput(text: string): number | null {
  const digits = text.replace(/\D/g, '').slice(0, 12);
  return digits === '' ? null : Number(digits);
}

/** Tambah/hapus satu id dari pilihan banyak. */
export function toggleId(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
}
