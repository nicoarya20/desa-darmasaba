// @vitest-environment node
// Saklar sembunyikan harga di halaman UMKM publik: baca pengaturan (fail-closed), source mengosongkan harga, saringan &
// urutan harga hilang bila tidak ada harga tampil, dan urutan harga dari URL diabaikan.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  pengaturanGet: vi.fn(),
  produkListGet: vi.fn(),
  produkDetailGet: vi.fn(),
  tokoGet: vi.fn(),
}));
vi.mock('@/lib/api-fetch', () => {
  const produk = Object.assign(() => ({ get: api.produkDetailGet }), {
    'find-many': { get: api.produkListGet },
    pengaturan: { find: { get: api.pengaturanGet } },
  });
  const umkm = Object.assign(() => ({ get: api.tokoGet }), { produk });
  return { default: { api: { ekonomi: { umkm } } } };
});

import { loadDetailProduk } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/detail-produk.source';
import { buildTokoProdukView } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-toko/toko-produk.logic';
import { loadDetailToko } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-toko/detail-toko.source';
import {
  produkFacets,
  resolveParams,
  sortProduk,
  urutOptions,
} from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-filter.logic';
import { parseKatalogParams } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-params.logic';
import { loadKatalogProduk } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog.source';
import type { KatalogProduk } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog.types';
import { buildKatalogView } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-view.logic';
import {
  hargaTampilDari,
  loadHargaTampil,
  terapkanHarga,
} from '@/app/(public)/(pages)/ekonomi/umkm/_lib/harga-publik.source';

const ok = (sembunyikanHarga: boolean) => ({ status: 200, data: { success: true, data: { sembunyikanHarga } } });
const url = (q: string) => parseKatalogParams(new URLSearchParams(q));

// test-only: hasil adapter katalog.
const P = (id: string, harga: number | null, createdAt: string): KatalogProduk => ({
  id,
  nama: `Produk ${id}`,
  harga,
  satuan: null,
  stok: 1,
  isUnggulan: false,
  createdAt,
  imageUrl: null,
  umkm: { id: 'u1', nama: 'Warung' },
  kategori: { id: 'k1', nama: 'Makanan' },
});
const tanpaHarga = [P('a', null, '2026-11-01'), P('b', null, '2026-11-03'), P('c', null, '2026-11-02')];
const berharga = [P('a', 30000, '2026-11-01'), P('b', 10000, '2026-11-03'), P('c', 20000, '2026-11-02')];

let errorSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset());
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('hargaTampilDari & loadHargaTampil', () => {
  it('membaca saklar: sembunyikan → false, tampil → true', () => {
    expect(hargaTampilDari(200, ok(true).data)).toBe(false);
    expect(hargaTampilDari(200, ok(false).data)).toBe(true);
  });

  it('respons tidak terbaca → null', () => {
    expect(hargaTampilDari(500, { success: false })).toBeNull();
    expect(hargaTampilDari(200, { success: true, data: null })).toBeNull();
    expect(hargaTampilDari(200, { success: true, data: { sembunyikanHarga: 'ya' } })).toBeNull();
  });

  it('memuat dari endpoint pengaturan', async () => {
    api.pengaturanGet.mockResolvedValue(ok(false));
    expect(await loadHargaTampil()).toBe(true);
    api.pengaturanGet.mockResolvedValue(ok(true));
    expect(await loadHargaTampil()).toBe(false);
  });

  it('fail-closed: galat server atau jaringan → harga disembunyikan dan galat dicatat', async () => {
    api.pengaturanGet.mockResolvedValue({ status: 500, data: { success: false } });
    expect(await loadHargaTampil()).toBe(false);
    api.pengaturanGet.mockRejectedValue(new Error('offline'));
    expect(await loadHargaTampil()).toBe(false);
    expect(errorSpy).toHaveBeenCalledTimes(2);
  });

  it('terapkanHarga mengosongkan harga hanya bila tidak boleh tampil', () => {
    expect(terapkanHarga({ harga: 5000 }, true)).toEqual({ harga: 5000 });
    expect(terapkanHarga({ harga: 5000 }, false)).toEqual({ harga: null, hargaMenyesuaikan: false });
    // Harga kosong + saklar sembunyikan aktif → teks "Harga menyesuaikan" juga tidak tampil.
    expect(terapkanHarga({ harga: null, hargaMenyesuaikan: true }, false)).toEqual({ harga: null, hargaMenyesuaikan: false });
  });
});

describe('source halaman publik', () => {
  const produkApi = { id: 'p1', nama: 'Keripik', harga: 15000, stok: 3, createdAt: '2026-11-01' };

  it('katalog: harga null bila disembunyikan, angka bila tampil', async () => {
    api.produkListGet.mockResolvedValue({ status: 200, data: { success: true, total: 1, data: [produkApi] } });
    api.pengaturanGet.mockResolvedValue(ok(true));
    expect((await loadKatalogProduk())[0].harga).toBeNull();
    api.pengaturanGet.mockResolvedValue(ok(false));
    expect((await loadKatalogProduk())[0].harga).toBe(15000);
  });

  it('detail produk: harga null bila disembunyikan', async () => {
    api.produkDetailGet.mockResolvedValue({ status: 200, data: { success: true, data: produkApi } });
    api.pengaturanGet.mockResolvedValue(ok(true));
    const d = await loadDetailProduk('p1');
    expect(d?.harga).toBeNull();
    expect(d?.nama).toBe('Keripik');
  });

  it('detail toko: harga semua produk toko null bila disembunyikan', async () => {
    const toko = { id: 'u1', nama: 'Warung', produk: [produkApi, { ...produkApi, id: 'p2', harga: 9000 }] };
    api.tokoGet.mockResolvedValue({ status: 200, data: { success: true, data: toko } });
    api.pengaturanGet.mockResolvedValue(ok(true));
    const d = await loadDetailToko('u1');
    expect(d?.produk.map((p) => p.harga)).toEqual([null, null]);
  });
});

describe('katalog tanpa harga', () => {
  it('facet harga false bila tidak ada harga tampil', () => {
    expect(produkFacets(tanpaHarga).harga).toBe(false);
    expect(produkFacets(berharga).harga).toBe(true);
  });

  it('rentang & urutan harga dari URL diabaikan saat harga disembunyikan, tetap dipakai saat tampil', () => {
    const raw = url('min=1000&max=50000&urut=harga-asc');
    expect(resolveParams(raw, produkFacets(tanpaHarga))).toMatchObject({ min: null, max: null, urut: 'terbaru' });
    expect(resolveParams(raw, produkFacets(berharga))).toMatchObject({ min: 1000, max: 50000, urut: 'harga-asc' });
    expect(resolveParams(url('urut=nama'), produkFacets(tanpaHarga)).urut).toBe('nama');
  });

  it('view: semua produk tetap tampil, urut terbaru, tanpa chip harga', () => {
    const view = buildKatalogView({ produk: tanpaHarga, toko: [] }, url('min=1000&urut=harga-desc'));
    expect(view.items.map((p) => p.id)).toEqual(['b', 'c', 'a']);
    expect(view.chips).toEqual([]);
    expect(view.activeCount).toBe(0);
  });

  it('pilihan Urutkan tanpa harga', () => {
    expect(urutOptions('produk', false).map((o) => o.value)).toEqual(['terbaru', 'nama']);
    expect(urutOptions('produk').map((o) => o.value)).toEqual(['terbaru', 'harga-asc', 'harga-desc', 'nama']);
  });

  it('urut harga menaruh harga tersembunyi (null) di akhir', () => {
    const campur = [P('x', null, '2026-11-05'), ...berharga];
    expect(sortProduk(campur, 'harga-asc').map((p) => p.id)).toEqual(['b', 'c', 'a', 'x']);
    expect(sortProduk(campur, 'harga-desc').map((p) => p.id)).toEqual(['a', 'c', 'b', 'x']);
  });

  it('daftar produk toko: urutan harga kembali ke bawaan dan pilihan harga hilang', () => {
    const view = buildTokoProdukView(tanpaHarga, 'harga-asc');
    expect(view).toMatchObject({ urut: 'terbaru', denganHarga: false });
    expect(view.items.map((p) => p.id)).toEqual(['b', 'c', 'a']);
    expect(buildTokoProdukView(berharga, 'harga-asc')).toMatchObject({ urut: 'harga-asc', denganHarga: true });
  });
});
