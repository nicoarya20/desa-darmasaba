// @vitest-environment node
// Pilihan Produk serupa di detail produk UMKM: kategori sama (nama ternormalisasi), lalu UMKM sama, maks 12.
import { describe, expect, it } from 'vitest';
import {
  pickProdukSerupa,
  PRODUK_SERUPA_MAX,
  type ProdukSerupaAcuan,
} from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/produk-serupa.logic';
import type { KatalogProduk } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog.types';

// test-only: bentuk hasil adapter katalog.
const produk = (id: string, kategori: string | null, umkmId: string | null): KatalogProduk => ({
  id,
  nama: `Produk ${id}`,
  harga: 10000,
  satuan: null,
  stok: 1,
  isUnggulan: false,
  createdAt: '2026-11-01T00:00:00.000Z',
  imageUrl: null,
  umkm: umkmId ? { id: umkmId, nama: `Toko ${umkmId}` } : null,
  kategori: kategori ? { id: `k-${kategori}`, nama: kategori } : null,
});

const acuan = (over: Partial<ProdukSerupaAcuan> = {}): ProdukSerupaAcuan => ({
  id: 'p1',
  kategoriNama: 'Makanan',
  umkmId: 'u1',
  ...over,
});
const ids = (list: KatalogProduk[]) => list.map((p) => p.id);

describe('pickProdukSerupa', () => {
  it('membuang produk yang sedang dibuka', () => {
    const all = [produk('p1', 'Makanan', 'u1'), produk('p2', 'Makanan', 'u2')];
    expect(ids(pickProdukSerupa(all, acuan()))).toEqual(['p2']);
  });

  it('kategori sama dibandingkan lewat nama ternormalisasi (kategori ganda beda id)', () => {
    const all = [
      produk('p2', '  makanan ', 'u2'),
      { ...produk('p3', 'MAKANAN', 'u3'), kategori: { id: 'k-lain', nama: 'MAKANAN' } },
      produk('p4', 'Sayur Mayur', 'u4'),
    ];
    expect(ids(pickProdukSerupa(all, acuan()))).toEqual(['p2', 'p3']);
  });

  it('kategori sama dulu, lalu UMKM sama tanpa duplikat, urutan mengikuti sumber', () => {
    const all = [
      produk('p5', 'Sembako', 'u1'),
      produk('p2', 'Makanan', 'u2'),
      produk('p6', 'Makanan', 'u1'), // sekategori & setoko → sekali saja, di kelompok kategori
      produk('p7', 'Protein Hewani', 'u1'),
      produk('p8', 'Sayur Mayur', 'u9'),
    ];
    expect(ids(pickProdukSerupa(all, acuan()))).toEqual(['p2', 'p6', 'p5', 'p7']);
  });

  it('tanpa kategori atau UMKM acuan, kelompok itu dilewati (null tidak mencocokkan null)', () => {
    const all = [produk('p2', null, null), produk('p3', 'Makanan', 'u1')];
    expect(ids(pickProdukSerupa(all, acuan({ kategoriNama: null, umkmId: null })))).toEqual([]);
    expect(ids(pickProdukSerupa(all, acuan({ kategoriNama: '  ', umkmId: 'u1' })))).toEqual(['p3']);
  });

  it(`dipotong ke PRODUK_SERUPA_MAX (${PRODUK_SERUPA_MAX})`, () => {
    const all = Array.from({ length: 20 }, (_, i) => produk(`x${i}`, i % 2 ? 'Makanan' : 'Lain', 'u1'));
    const hasil = pickProdukSerupa(all, acuan());
    expect(PRODUK_SERUPA_MAX).toBe(12);
    expect(hasil).toHaveLength(12);
    expect(ids(hasil).slice(0, 10).every((id) => Number(id.slice(1)) % 2 === 1)).toBe(true);
    expect(new Set(ids(hasil)).size).toBe(12);
  });

  it('tidak ada yang serupa → daftar kosong', () => {
    expect(pickProdukSerupa([produk('p2', 'Sembako', 'u2')], acuan())).toEqual([]);
    expect(pickProdukSerupa([], acuan())).toEqual([]);
  });
});
