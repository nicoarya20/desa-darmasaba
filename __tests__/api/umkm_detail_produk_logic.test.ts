// @vitest-environment node
// Detail produk UMKM publik: baca respons API (siap / tidak ditemukan / galat), saring produk yang tak boleh tampil
// (MITIGASI SEMENTARA umkm-detail), adapter ke bentuk halaman, dan sumber data.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({ res: { status: 200, data: null as unknown }, ids: [] as string[] }));

vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      ekonomi: {
        umkm: {
          produk: ({ id }: { id: string }) => {
            h.ids.push(id);
            return { get: async () => h.res };
          },
        },
      },
    },
  },
}));

import {
  isDetailTampil,
  readDetailBody,
  toDetailProduk,
  type ProdukDetailApiItem,
} from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/detail-produk.adapter.logic';
import { loadDetailProduk } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/detail-produk.source';

// test-only: bentuk respons GET /api/ekonomi/umkm/produk/:id (stg 2026-11-13).
const item = (over: Partial<ProdukDetailApiItem> = {}): ProdukDetailApiItem => ({
  id: 'prd-1',
  nama: 'Keripik Pisang',
  harga: 15000,
  satuan: 'bungkus',
  deskripsi: '<p>Renyah</p>',
  stok: 3,
  isUnggulan: true,
  isActive: true,
  deletedAt: null,
  alamatUsaha: null,
  image: { link: '/api/img/keripik.webp' },
  umkm: { id: 'u1', nama: 'Warung Bu Made', pemilik: 'Made', alamat: 'Br. Gede', kontak: '0812', isActive: true },
  kategoriProduk: { id: 'k1', nama: 'Makanan' },
  linkTokoOnline: [{ id: 'l1', platform: 'SHOPEE', url: 'https://shopee.co.id/x' }],
  ...over,
});

describe('readDetailBody', () => {
  it('success → data produk', () => {
    const data = item();
    expect(readDetailBody('prd-1', 200, { success: true, data })).toBe(data);
  });

  it('pesan "tidak ditemukan" (HTTP 200) → null', () => {
    expect(readDetailBody('x', 200, { success: false, message: 'Produk UMKM tidak ditemukan' })).toBeNull();
  });

  it('galat server → Error berkonteks id + pesan', () => {
    expect(() => readDetailBody('prd-9', 200, { success: false, message: 'Gagal mengambil detail produk UMKM' })).toThrow(
      /prd-9.*Gagal mengambil detail produk UMKM/,
    );
  });

  it('HTTP bukan 200 → Error dengan status', () => {
    expect(() => readDetailBody('prd-1', 500, null)).toThrow(/HTTP 500/);
  });

  it('respons tanpa data / bentuk tak dikenal → Error', () => {
    expect(() => readDetailBody('prd-1', 200, { success: true, data: null })).toThrow(/respons tidak valid/);
    expect(() => readDetailBody('prd-1', 200, undefined)).toThrow(/respons tidak valid/);
  });
});

describe('isDetailTampil (MITIGASI SEMENTARA umkm-detail)', () => {
  it('produk aktif milik UMKM aktif tampil; kolom kosong = aktif', () => {
    expect(isDetailTampil(item())).toBe(true);
    expect(isDetailTampil(item({ isActive: null, umkm: null }))).toBe(true);
  });

  it.each([
    ['terhapus', { deletedAt: '2026-11-01T00:00:00.000Z' }],
    ['nonaktif', { isActive: false }],
    ['UMKM nonaktif', { umkm: { id: 'u1', nama: 'W', isActive: false } }],
  ])('%s → tidak tampil', (_, over) => {
    expect(isDetailTampil(item(over))).toBe(false);
  });
});

describe('toDetailProduk', () => {
  const sanitize = (html: string) => `[clean]${html}`;

  it('memetakan kolom produk, penjual, kategori, link, dan stok (untuk alur pesanan saja)', () => {
    const d = toDetailProduk(item(), sanitize);
    expect(d).toEqual({
      id: 'prd-1',
      nama: 'Keripik Pisang',
      harga: 15000,
      satuan: 'bungkus',
      isUnggulan: true,
      deskripsiHtml: '[clean]<p>Renyah</p>',
      fotos: [{ src: '/api/img/keripik.webp', alt: 'Keripik Pisang' }],
      kategori: { id: 'k1', nama: 'Makanan' },
      penjual: { id: 'u1', nama: 'Warung Bu Made', pemilik: 'Made', alamat: 'Br. Gede', kontak: '0812' },
      alamat: 'Br. Gede',
      linkTokoOnline: [{ id: 'l1', platform: 'SHOPEE', url: 'https://shopee.co.id/x' }],
      stok: 3,
    });
  });

  it('alamatUsaha diutamakan; kosong/spasi → alamat UMKM; keduanya kosong → null', () => {
    expect(toDetailProduk(item({ alamatUsaha: ' Pasar Desa ' }), sanitize).alamat).toBe('Pasar Desa');
    expect(toDetailProduk(item({ alamatUsaha: '   ' }), sanitize).alamat).toBe('Br. Gede');
    const tanpa = item({ alamatUsaha: '', umkm: { id: 'u1', nama: 'W', alamat: ' ' } });
    expect(toDetailProduk(tanpa, sanitize).alamat).toBeNull();
  });

  it('tanpa foto / link foto kosong → fotos []', () => {
    expect(toDetailProduk(item({ image: null }), sanitize).fotos).toEqual([]);
    expect(toDetailProduk(item({ image: { link: '  ' } }), sanitize).fotos).toEqual([]);
  });

  it('deskripsi kosong → "" tanpa memanggil sanitize; satuan spasi → null; isUnggulan null → false', () => {
    const spy = vi.fn(sanitize);
    const d = toDetailProduk(item({ deskripsi: null, satuan: ' ', isUnggulan: null }), spy);
    expect(d.deskripsiHtml).toBe('');
    expect(spy).not.toHaveBeenCalled();
    expect(d.satuan).toBeNull();
    expect(d.isUnggulan).toBe(false);
  });

  it('tanpa UMKM/kategori/link → null/[]; kolom penjual kosong → null', () => {
    const d = toDetailProduk(item({ umkm: null, kategoriProduk: null, linkTokoOnline: null }), sanitize);
    expect(d.penjual).toBeNull();
    expect(d.kategori).toBeNull();
    expect(d.linkTokoOnline).toEqual([]);
    const p = toDetailProduk(item({ umkm: { id: 'u2', nama: 'Toko', pemilik: '', kontak: ' ' } }), sanitize).penjual;
    expect(p).toEqual({ id: 'u2', nama: 'Toko', pemilik: null, alamat: null, kontak: null });
  });

  it('sanitize bawaan (DOMPurify) di lingkungan tanpa DOM → "" (tidak merender HTML mentah)', () => {
    expect(toDetailProduk(item({ deskripsi: '<img src=x onerror=alert(1)>' })).deskripsiHtml).toBe('');
  });
});

describe('loadDetailProduk', () => {
  beforeEach(() => {
    h.ids = [];
  });

  it('memanggil endpoint per id dan mengembalikan bentuk halaman', async () => {
    h.res = { status: 200, data: { success: true, data: item() } };
    const d = await loadDetailProduk('prd-1');
    expect(h.ids).toEqual(['prd-1']);
    expect(d?.nama).toBe('Keripik Pisang');
  });

  it('produk nonaktif atau "tidak ditemukan" → null', async () => {
    h.res = { status: 200, data: { success: true, data: item({ isActive: false }) } };
    expect(await loadDetailProduk('prd-1')).toBeNull();
    h.res = { status: 200, data: { success: false, message: 'Produk UMKM tidak ditemukan' } };
    expect(await loadDetailProduk('prd-1')).toBeNull();
  });

  it('galat server → reject berkonteks', async () => {
    h.res = { status: 200, data: { success: false, message: 'Gagal mengambil detail produk UMKM' } };
    await expect(loadDetailProduk('prd-1')).rejects.toThrow(/prd-1/);
  });
});
