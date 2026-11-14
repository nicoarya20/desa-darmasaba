// @vitest-environment node
// Daftar produk detail toko UMKM: urutan memakai sortProduk katalog, Urutkan tampil mulai 2 produk.
import { describe, expect, it } from 'vitest';
import {
  buildTokoProdukView,
  TOKO_URUT_DEFAULT,
  TOKO_URUT_MIN_PRODUK,
} from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-toko/toko-produk.logic';
import type { KatalogProduk } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog.types';

// test-only: harga & tanggal sengaja tidak searah dengan nama supaya tiap urutan berbeda.
const produk = (id: string, nama: string, harga: number, tgl: string): KatalogProduk => ({
  id,
  nama,
  harga,
  satuan: null,
  stok: 1,
  isUnggulan: false,
  createdAt: `2026-11-${tgl}T00:00:00.000Z`,
  imageUrl: null,
  umkm: { id: 'u1', nama: 'Sayur Segar Pak Wayan' },
  kategori: null,
});
const items = [produk('a', 'Cabai', 20000, '02'), produk('b', 'Bayam', 5000, '05'), produk('c', 'Tomat', 12000, '01')];
const ids = (list: KatalogProduk[]) => list.map((p) => p.id);

describe('buildTokoProdukView', () => {
  it('bawaan = terbaru, sama dengan tab Produk katalog', () => {
    expect(TOKO_URUT_DEFAULT).toBe('terbaru');
    expect(ids(buildTokoProdukView(items, TOKO_URUT_DEFAULT).items)).toEqual(['b', 'a', 'c']);
  });

  it('urutan berubah sesuai pilihan', () => {
    expect(ids(buildTokoProdukView(items, 'harga-asc').items)).toEqual(['b', 'c', 'a']);
    expect(ids(buildTokoProdukView(items, 'harga-desc').items)).toEqual(['a', 'c', 'b']);
    expect(ids(buildTokoProdukView(items, 'nama').items)).toEqual(['b', 'a', 'c']);
  });

  it('tidak mengubah larik masukan', () => {
    buildTokoProdukView(items, 'harga-asc');
    expect(ids(items)).toEqual(['a', 'b', 'c']);
  });

  it('Urutkan tampil hanya bila produk ≥ 2', () => {
    expect(TOKO_URUT_MIN_PRODUK).toBe(2);
    expect(buildTokoProdukView([], 'terbaru').showUrut).toBe(false);
    expect(buildTokoProdukView(items.slice(0, 1), 'terbaru').showUrut).toBe(false);
    expect(buildTokoProdukView(items.slice(0, 2), 'terbaru').showUrut).toBe(true);
  });
});
