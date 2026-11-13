// @vitest-environment node
// Katalog UMKM publik: params URL, adapter API → kartu, saring/urut/hitung di klien, gabungan status muat, sumber data.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { produkGet, umkmGet } = vi.hoisted(() => ({ produkGet: vi.fn(), umkmGet: vi.fn() }));
vi.mock('@/lib/api-fetch', () => {
  const umkm = Object.assign({ 'find-many': { get: umkmGet } }, { produk: { 'find-many': { get: produkGet } } });
  return { default: { api: { ekonomi: { umkm } } } };
});

import {
  countProdukPerToko,
  isProdukTampil,
  isTokoAktif,
  toKatalogProduk,
  toKatalogToko,
  type ProdukApiItem,
} from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-adapter.logic';
import {
  activeChips,
  expandIds,
  filterProduk,
  filterToko,
  hargaLabel,
  matchesSearch,
  normalizeSearch,
  produkFacets,
  resolveParams,
  sortProduk,
  sortToko,
  toggleOption,
  tokoFacets,
  urutOptions,
} from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-filter.logic';
import { KATALOG_LIST_LIMIT } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-filter.meta';
import {
  clearFilters,
  countActiveFilters,
  emptyParams,
  katalogHref,
  parseHargaInput,
  parseKatalogParams,
  switchTab,
  type KatalogParams,
} from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-params.logic';
import { buildKatalogView } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-view.logic';
import { loadKatalogProduk, loadKatalogToko } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog.source';
import type { KatalogProduk, KatalogToko } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog.types';
import { combineLoad } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/use-katalog-data';

const url = (query: string) => parseKatalogParams(new URLSearchParams(query));

// test-only: data katalog ringkas (3 toko, 2 kategori).
const P = (over: Partial<KatalogProduk> & { id: string }): KatalogProduk => ({
  nama: over.id,
  harga: 10000,
  satuan: null,
  stok: 5,
  isUnggulan: false,
  createdAt: '2026-11-01T00:00:00.000Z',
  imageUrl: null,
  umkm: { id: 'u1', nama: 'Warung Bu Made' },
  kategori: { id: 'k1', nama: 'Makanan' },
  ...over,
});
const produk: KatalogProduk[] = [
  P({ id: 'telur', nama: 'Telur Ayam Kampung', harga: 30000, createdAt: '2026-11-05T00:00:00.000Z' }),
  P({ id: 'kopi', nama: 'Kopi Bali', harga: 80000, stok: 0, isUnggulan: true, kategori: { id: 'k2', nama: 'Minuman' }, umkm: { id: 'u2', nama: 'Kopi Darmasaba' } }),
  P({ id: 'arak', nama: 'arak Madu', harga: 30000, createdAt: '2026-11-03T00:00:00.000Z', kategori: { id: 'k2', nama: 'Minuman' }, umkm: { id: 'u3', nama: 'Tirta' } }),
  P({ id: 'tanpa', nama: 'Kerajinan', harga: 5000, kategori: null, umkm: null, createdAt: '2026-10-01T00:00:00.000Z' }),
];
const T = (over: Partial<KatalogToko> & { id: string }): KatalogToko => ({
  nama: over.id,
  pemilik: 'Pemilik',
  alamat: null,
  imageUrl: null,
  kategori: { id: 'k1', nama: 'Makanan' },
  createdAt: '2026-11-01T00:00:00.000Z',
  ...over,
});
const toko: KatalogToko[] = [
  T({ id: 'u2', nama: 'Kopi Darmasaba', pemilik: 'Ketut', alamat: 'Banjar Tengah', kategori: { id: 'k2', nama: 'Minuman' }, createdAt: '2026-11-09T00:00:00.000Z' }),
  T({ id: 'u1', nama: 'Warung Bu Made', pemilik: 'Made Sari' }),
];
const params = (over: Partial<KatalogParams> = {}): KatalogParams => ({ ...emptyParams('produk'), ...over });

describe('parseKatalogParams & katalogHref', () => {
  it('URL kosong → tab produk, urutan terbaru, tanpa saringan', () => {
    expect(url('')).toEqual(emptyParams('produk'));
    expect(katalogHref(url(''))).toBe('/ekonomi/umkm');
  });

  it('membaca semua saringan produk; id dipisah koma, unik, tanpa yang kosong', () => {
    const p = url('q=%20kopi%20&kategori=k1,,k2,k1&toko=u2&min=1000&max=50000&tersedia=1&unggulan=1&urut=harga-desc');
    expect(p).toEqual({ tab: 'produk', q: 'kopi', kategori: ['k1', 'k2'], toko: ['u2'], min: 1000, max: 50000, tersedia: true, unggulan: true, urut: 'harga-desc' });
    expect(katalogHref(p)).toBe('/ekonomi/umkm?q=kopi&kategori=k1,k2&toko=u2&min=1000&max=50000&tersedia=1&unggulan=1&urut=harga-desc');
  });

  it('nilai tak dikenal diabaikan; min > maks ditukar', () => {
    const p = url('tab=lain&urut=acak&min=abc&max=-5&tersedia=ya');
    expect(p).toEqual(emptyParams('produk'));
    expect(url('min=90000&max=1000')).toMatchObject({ min: 1000, max: 90000 });
  });

  it('tab toko hanya membaca kategori & urutan toko; saringan produk dibuang', () => {
    const p = url('tab=toko&q=made&kategori=k1&toko=u1&min=5&tersedia=1&urut=terbaru');
    expect(p).toEqual({ ...emptyParams('toko', 'made'), kategori: ['k1'], urut: 'terbaru' });
    expect(url('tab=toko&urut=harga-asc').urut).toBe('nama');
    expect(katalogHref(p)).toBe('/ekonomi/umkm?tab=toko&q=made&kategori=k1&urut=terbaru');
    expect(katalogHref(emptyParams('toko'))).toBe('/ekonomi/umkm?tab=toko');
  });

  it('kata kunci di-encode; hasil href terbaca kembali sama', () => {
    const p = params({ q: 'kopi & teh', kategori: ['a b'] });
    expect(katalogHref(p)).toBe('/ekonomi/umkm?q=kopi%20%26%20teh&kategori=a%20b');
    expect(url(katalogHref(p).split('?')[1])).toEqual(p);
  });
});

describe('pengubah params', () => {
  it('switchTab mempertahankan q, membuang saringan & urutan; tab sama → tetap', () => {
    const p = params({ q: 'kopi', kategori: ['k1'], tersedia: true, urut: 'nama' });
    expect(switchTab(p, 'toko')).toEqual(emptyParams('toko', 'kopi'));
    expect(switchTab(p, 'produk')).toBe(p);
  });

  it('clearFilters mempertahankan tab, q, urutan', () => {
    const p = params({ q: 'kopi', kategori: ['k1'], toko: ['u1'], min: 1, max: 2, tersedia: true, unggulan: true, urut: 'nama' });
    expect(clearFilters(p)).toEqual({ ...emptyParams('produk', 'kopi'), urut: 'nama' });
  });

  it('countActiveFilters: tiap id satu, rentang harga satu', () => {
    expect(countActiveFilters(params({ kategori: ['a', 'b'], toko: ['u'], min: 5, max: 9, tersedia: true }))).toBe(5);
    expect(countActiveFilters(params({ q: 'kopi' }))).toBe(0);
  });

  it('parseHargaInput hanya membaca digit; kosong → null', () => {
    expect(parseHargaInput('Rp10.000')).toBe(10000);
    expect(parseHargaInput('  ')).toBeNull();
    expect(parseHargaInput('0')).toBe(0);
  });
});

describe('adapter API → kartu', () => {
  const api: ProdukApiItem & { rating: number } = {
    id: 'p1', nama: 'Kopi', harga: 80000, satuan: 'kg', stok: 2, isUnggulan: true, createdAt: '2026-11-01T00:00:00.000Z',
    rating: 4.6, image: { link: 'https://cdn/x.jpg' }, umkm: { id: 'u1', nama: 'Toko' }, kategoriProduk: { id: 'k1', nama: 'Minuman' },
  };

  it('toKatalogProduk memetakan relasi & foto; rating seed tidak dibawa', () => {
    const out = toKatalogProduk(api);
    expect(out).toEqual({
      id: 'p1', nama: 'Kopi', harga: 80000, satuan: 'kg', stok: 2, isUnggulan: true, createdAt: '2026-11-01T00:00:00.000Z',
      imageUrl: 'https://cdn/x.jpg', umkm: { id: 'u1', nama: 'Toko' }, kategori: { id: 'k1', nama: 'Minuman' },
    });
    expect(out).not.toHaveProperty('rating');
  });

  it('kolom kosong → null/false', () => {
    const out = toKatalogProduk({ id: 'p', nama: 'X', harga: 1, stok: 0, createdAt: 'c', image: { link: '' }, umkm: null });
    expect(out).toMatchObject({ satuan: null, isUnggulan: false, imageUrl: null, umkm: null, kategori: null });
  });

  it('toKatalogToko & isTokoAktif (kosong = aktif)', () => {
    expect(toKatalogToko({ id: 'u', nama: 'N', pemilik: 'P', createdAt: 'c', kategori: { id: 'k', nama: 'K' } })).toEqual({
      id: 'u', nama: 'N', pemilik: 'P', alamat: null, imageUrl: null, kategori: { id: 'k', nama: 'K' }, createdAt: 'c',
    });
    expect(isTokoAktif({ isActive: false })).toBe(false);
    expect(isTokoAktif({ isActive: true })).toBe(true);
    expect(isTokoAktif({})).toBe(true);
  });

  it('isProdukTampil: produk UMKM nonaktif disembunyikan, tanpa relasi UMKM tetap tampil', () => {
    expect(isProdukTampil({ umkm: { id: 'u', nama: 'U', isActive: false } })).toBe(false);
    expect(isProdukTampil({ umkm: { id: 'u', nama: 'U', isActive: true } })).toBe(true);
    expect(isProdukTampil({ umkm: { id: 'u', nama: 'U' } })).toBe(true);
    expect(isProdukTampil({ umkm: null })).toBe(true);
    expect(isProdukTampil({})).toBe(true);
  });

  it('countProdukPerToko menghitung dari daftar produk', () => {
    const counts = countProdukPerToko(produk);
    expect(counts.get('u1')).toBe(1);
    expect(counts.get('u2')).toBe(1);
    expect(counts.size).toBe(3);
  });
});

describe('cari, saring, urut', () => {
  it('normalizeSearch & matchesSearch: kapital/spasi ganda diabaikan, semua kata harus cocok di salah satu kolom', () => {
    expect(normalizeSearch('  Kopi   BALI ')).toBe('kopi bali');
    expect(matchesSearch('kopi  bu made', ['Kopi Tubruk', 'Warung Bu Made'])).toBe(true);
    expect(matchesSearch('kopi teh', ['Kopi Tubruk', null])).toBe(false);
    expect(matchesSearch('   ', ['apa saja'])).toBe(true);
  });

  it('produk dicari di nama produk + nama UMKM', () => {
    expect(filterProduk(produk, params({ q: 'darmasaba' })).map((p) => p.id)).toEqual(['kopi']);
    expect(filterProduk(produk, params({ q: 'TELUR' })).map((p) => p.id)).toEqual(['telur']);
  });

  it('saringan produk: kategori/toko banyak pilihan, harga inklusif, tersedia, unggulan', () => {
    const ids = (p: Partial<KatalogParams>) => filterProduk(produk, params(p)).map((x) => x.id);
    expect(ids({ kategori: ['k2'] })).toEqual(['kopi', 'arak']);
    expect(ids({ kategori: ['k1', 'k2'] })).toEqual(['telur', 'kopi', 'arak']);
    expect(ids({ toko: ['u1', 'u3'] })).toEqual(['telur', 'arak']);
    expect(ids({ min: 30000, max: 30000 })).toEqual(['telur', 'arak']);
    expect(ids({ max: 5000 })).toEqual(['tanpa']);
    expect(ids({ tersedia: true })).not.toContain('kopi');
    expect(ids({ unggulan: true })).toEqual(['kopi']);
  });

  it('toko dicari di nama, pemilik, alamat; saring kategori usaha', () => {
    expect(filterToko(toko, params({ tab: 'toko', q: 'sari' })).map((t) => t.id)).toEqual(['u1']);
    expect(filterToko(toko, params({ tab: 'toko', q: 'banjar tengah' })).map((t) => t.id)).toEqual(['u2']);
    expect(filterToko(toko, params({ tab: 'toko', kategori: ['k1'] })).map((t) => t.id)).toEqual(['u1']);
  });

  it('urutan produk: terbaru, harga (seri → terbaru), nama tanpa peduli kapital', () => {
    expect(sortProduk(produk, 'terbaru').map((p) => p.id)).toEqual(['telur', 'arak', 'kopi', 'tanpa']);
    expect(sortProduk(produk, 'harga-asc').map((p) => p.id)).toEqual(['tanpa', 'telur', 'arak', 'kopi']);
    expect(sortProduk(produk, 'harga-desc').map((p) => p.id)).toEqual(['kopi', 'telur', 'arak', 'tanpa']);
    expect(sortProduk(produk, 'nama').map((p) => p.id)).toEqual(['arak', 'tanpa', 'kopi', 'telur']);
  });

  it('urutan toko: nama (bawaan) atau terbaru; pilihan urutkan per tab', () => {
    expect(sortToko(toko, 'nama').map((t) => t.id)).toEqual(['u2', 'u1']);
    expect(sortToko(toko, 'terbaru').map((t) => t.id)).toEqual(['u2', 'u1']);
    expect(urutOptions('produk').map((o) => o.label)).toEqual(['Terbaru', 'Harga terendah', 'Harga tertinggi', 'Nama A–Z']);
    expect(urutOptions('toko').map((o) => o.value)).toEqual(['nama', 'terbaru']);
  });
});

describe('facet, chip, tampilan', () => {
  it('produkFacets: hanya kategori/toko yang punya produk, urut nama, dengan jumlah', () => {
    const f = produkFacets(produk);
    expect(f.kategori).toEqual([
      { id: 'k1', ids: ['k1'], label: 'Makanan', count: 1 },
      { id: 'k2', ids: ['k2'], label: 'Minuman', count: 2 },
    ]);
    expect(f.toko.map((t) => t.label)).toEqual(['Kopi Darmasaba', 'Tirta', 'Warung Bu Made']);
    expect(f.tersedia).toBe(3);
    expect(f.unggulan).toBe(1);
    expect(tokoFacets(toko).kategori).toEqual([
      { id: 'k1', ids: ['k1'], label: 'Makanan', count: 1 },
      { id: 'k2', ids: ['k2'], label: 'Minuman', count: 1 },
    ]);
  });

  it('resolveParams membuang id yang tidak ada di data', () => {
    const p = resolveParams(params({ kategori: ['k2', 'hilang'], toko: ['zzz'] }), produkFacets(produk));
    expect(p.kategori).toEqual(['k2']);
    expect(p.toko).toEqual([]);
  });

  it('hargaLabel & activeChips (urutan panel; hapus chip → params tanpa nilai itu)', () => {
    expect(hargaLabel(10000, 50000)).toBe('Rp10.000–Rp50.000');
    expect(hargaLabel(10000, null)).toBe('Mulai Rp10.000');
    expect(hargaLabel(null, 50000)).toBe('Sampai Rp50.000');
    expect(hargaLabel(null, null)).toBeNull();
    const p = params({ q: 'x', kategori: ['k2'], toko: ['u3'], min: 1000, tersedia: true, unggulan: true });
    const chips = activeChips(p, produkFacets(produk));
    expect(chips.map((c) => c.label)).toEqual(['Minuman', 'Tirta', 'Mulai Rp1.000', 'Tersedia', 'Unggulan']);
    expect(chips[0].next.kategori).toEqual([]);
    expect(chips[2].next).toMatchObject({ min: null, max: null, q: 'x', toko: ['u3'] });
  });

  it('buildKatalogView produk: total dari data, hasil tersaring & terurut, chip', () => {
    const view = buildKatalogView({ produk, toko }, url('kategori=k2,asing&urut=harga-asc'));
    expect(view.tab).toBe('produk');
    expect(view.total).toBe(4);
    expect(view.items.map((p) => p.id)).toEqual(['arak', 'kopi']);
    expect(view.params.kategori).toEqual(['k2']);
    expect(view.activeCount).toBe(1);
  });

  it('buildKatalogView toko: jumlah produk per toko', () => {
    const view = buildKatalogView({ produk, toko }, url('tab=toko'));
    if (view.tab !== 'toko') throw new Error('tab salah');
    expect(view.items.map((t) => t.id)).toEqual(['u2', 'u1']);
    expect(view.jumlahProduk.get('u2')).toBe(1);
    expect(view.chips).toEqual([]);
  });

  it('produkFacets toko: tidak digabung walau nama sama (id berbeda = toko berbeda)', () => {
    const twin = [...produk, P({ id: 'x', umkm: { id: 'u9', nama: 'Tirta' } })];
    expect(produkFacets(twin).toko.filter((t) => t.label === 'Tirta').map((t) => t.id)).toEqual(['u3', 'u9']);
  });

  it('combineLoad: galat menang, siap bila keduanya siap', () => {
    expect(combineLoad({ status: 'error' }, { status: 'loading' })).toEqual({ status: 'error' });
    expect(combineLoad({ status: 'ready', data: [] }, { status: 'loading' })).toEqual({ status: 'loading' });
    expect(combineLoad({ status: 'ready', data: produk }, { status: 'ready', data: toko })).toEqual({
      status: 'ready',
      data: { produk, toko },
    });
  });
});

// test-only: kasus stg 2026-11-13, dua kategori "Makanan" berbeda id (nama beda spasi/kapital).
describe('kategori bernama sama digabung', () => {
  const dup = [
    P({ id: 'a', kategori: { id: 'zz-makanan', nama: '  makanan ' } }),
    P({ id: 'b', kategori: { id: 'aa-makanan', nama: 'Makanan ' } }),
    P({ id: 'c', kategori: { id: 'zz-makanan', nama: '  makanan ' } }),
    P({ id: 'd', kategori: { id: 'k2', nama: 'Minuman' } }),
  ];
  const facets = produkFacets(dup);

  it('satu baris berjumlah total; id wakil = id terkecil, label dari id wakil (stabil)', () => {
    expect(facets.kategori[0]).toEqual({ id: 'aa-makanan', ids: ['aa-makanan', 'zz-makanan'], label: 'Makanan', count: 3 });
    expect(facets.kategori).toHaveLength(2);
    expect(produkFacets([...dup].reverse()).kategori[0]).toMatchObject({ id: 'aa-makanan', label: 'Makanan' });
  });

  it('id mana pun dari grup di URL memilih grupnya; URL ditulis dengan id wakil', () => {
    const p = resolveParams(url('kategori=zz-makanan,aa-makanan'), facets);
    expect(p.kategori).toEqual(['aa-makanan']);
    expect(katalogHref(p)).toBe('/ekonomi/umkm?kategori=aa-makanan');
  });

  it('saringan memakai semua id grup; chip satu per grup', () => {
    const view = buildKatalogView({ produk: dup, toko: [] }, url('kategori=zz-makanan'));
    expect(view.items.map((x) => x.id).sort()).toEqual(['a', 'b', 'c']);
    expect(view.chips.map((c) => c.label)).toEqual(['Makanan']);
    expect(view.chips[0].next.kategori).toEqual([]);
    expect(expandIds(['aa-makanan'], facets.kategori)).toEqual(['aa-makanan', 'zz-makanan']);
  });

  it('toggleOption: id anggota mana pun terpilih → seluruh grup dilepas; belum → id wakil ditambah', () => {
    const makanan = facets.kategori[0];
    expect(toggleOption(['zz-makanan', 'k2'], makanan)).toEqual(['k2']);
    expect(toggleOption(['k2'], makanan)).toEqual(['k2', 'aa-makanan']);
  });

  it('tab Toko ikut digabung', () => {
    const t = [T({ id: 't1', kategori: { id: 'zz', nama: 'Makanan' } }), T({ id: 't2', kategori: { id: 'aa', nama: 'MAKANAN' } })];
    expect(tokoFacets(t).kategori).toEqual([{ id: 'aa', ids: ['aa', 'zz'], label: 'MAKANAN', count: 2 }]);
    const view = buildKatalogView({ produk: [], toko: t }, url('tab=toko&kategori=zz'));
    expect(view.items).toHaveLength(2);
  });
});

describe('katalog.source', () => {
  beforeEach(() => {
    produkGet.mockReset();
    umkmGet.mockReset();
  });

  it('memuat produk dengan limit katalog lalu dipetakan ke bentuk kartu', async () => {
    produkGet.mockResolvedValue({ status: 200, data: { success: true, total: 1, data: [{ id: 'p', nama: 'X', harga: 1, stok: 1, createdAt: 'c' }] } });
    const out = await loadKatalogProduk();
    expect(produkGet).toHaveBeenCalledWith({ query: { page: 1, limit: KATALOG_LIST_LIMIT } });
    expect(out[0]).toMatchObject({ id: 'p', imageUrl: null, kategori: null });
  });

  it('total > yang dimuat → console.warn', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    produkGet.mockResolvedValue({ status: 200, data: { success: true, total: 150, data: [] } });
    await loadKatalogProduk();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('150 produk'));
    warn.mockRestore();
  });

  it('respons gagal → Error berkonteks (tidak ditelan)', async () => {
    produkGet.mockResolvedValue({ status: 500, data: { success: false, message: 'Gagal mengambil data produk UMKM' } });
    await expect(loadKatalogProduk()).rejects.toThrow('find-many produk UMKM gagal (HTTP 500): Gagal mengambil data produk UMKM');
  });

  it('produk milik UMKM nonaktif dibuang', async () => {
    const item = (id: string, umkm: unknown) => ({ id, nama: id, harga: 1, stok: 1, createdAt: 'c', umkm });
    produkGet.mockResolvedValue({
      status: 200,
      data: { success: true, data: [
        item('aktif', { id: 'u1', nama: 'A', isActive: true }),
        item('mati', { id: 'u2', nama: 'B', isActive: false }),
        item('yatim', null),
      ] },
    });
    expect((await loadKatalogProduk()).map((p) => p.id)).toEqual(['aktif', 'yatim']);
  });

  it('UMKM nonaktif dibuang', async () => {
    umkmGet.mockResolvedValue({
      status: 200,
      data: { success: true, data: [
        { id: 'a', nama: 'A', pemilik: 'P', createdAt: 'c', isActive: true },
        { id: 'b', nama: 'B', pemilik: 'P', createdAt: 'c', isActive: false },
      ] },
    });
    expect((await loadKatalogToko()).map((t) => t.id)).toEqual(['a']);
  });
});
