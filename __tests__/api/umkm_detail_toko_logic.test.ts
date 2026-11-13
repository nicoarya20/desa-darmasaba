// @vitest-environment node
// Detail toko UMKM publik: baca respons API (siap / tidak ditemukan / galat), saring toko & produk yang tak boleh tampil
// (MITIGASI SEMENTARA umkm-detail-toko), adapter ke bentuk halaman, sumber data, dan pesan WhatsApp toko.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({ res: { status: 200, data: null as unknown }, ids: [] as string[] }));

vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      ekonomi: {
        umkm: ({ id }: { id: string }) => {
          h.ids.push(id);
          return { get: async () => h.res };
        },
      },
    },
  },
}));

import {
  isProdukTokoTampil,
  isTokoTampil,
  readTokoBody,
  toDetailToko,
  type TokoDetailApiItem,
  type TokoProdukApiItem,
} from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-toko/detail-toko.adapter.logic';
import { loadDetailToko } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-toko/detail-toko.source';
import { buildHubungiPenjualMessage, buildHubungiPenjualUrl } from '@/app/(public)/(pages)/ekonomi/umkm/_lib/pesanan';

// test-only: bentuk respons GET /api/ekonomi/umkm/:id (stg 2026-11-13).
const produk = (over: Partial<TokoProdukApiItem> = {}): TokoProdukApiItem => ({
  id: 'prd-1',
  nama: 'Bayam',
  harga: 5000,
  satuan: 'ikat',
  stok: 10,
  isUnggulan: false,
  isActive: true,
  deletedAt: null,
  createdAt: '2026-11-01T00:00:00.000Z',
  image: { link: '/api/img/bayam.webp' },
  ...over,
});

const toko = (over: Partial<TokoDetailApiItem> = {}): TokoDetailApiItem => ({
  id: 'umkm-3',
  nama: 'Sayur Segar Pak Wayan',
  pemilik: 'Wayan',
  deskripsi: '<p>Sayur pagi</p>',
  alamat: 'Br. Tengah',
  kontak: '081234567890',
  isActive: true,
  deletedAt: null,
  image: { link: '/api/img/toko.webp' },
  kategori: { id: 'k1', nama: 'Pertanian' },
  produk: [produk()],
  ...over,
});

describe('readTokoBody', () => {
  it('success → data UMKM', () => {
    const data = toko();
    expect(readTokoBody('umkm-3', 200, { success: true, data })).toBe(data);
  });

  it('"UMKM tidak ditemukan" (HTTP 200) → null', () => {
    expect(readTokoBody('x', 200, { success: false, message: 'UMKM tidak ditemukan' })).toBeNull();
  });

  it('galat server → Error berkonteks id + pesan', () => {
    expect(() => readTokoBody('umkm-9', 200, { success: false, message: 'Gagal mengambil detail UMKM' })).toThrow(
      /umkm-9.*Gagal mengambil detail UMKM/,
    );
  });

  it('HTTP bukan 200 → Error dengan status; respons tak dikenal → Error', () => {
    expect(() => readTokoBody('umkm-3', 500, null)).toThrow(/HTTP 500/);
    expect(() => readTokoBody('umkm-3', 200, { success: true, data: null })).toThrow(/respons tidak valid/);
    expect(() => readTokoBody('umkm-3', 200, undefined)).toThrow(/respons tidak valid/);
  });
});

describe('isTokoTampil / isProdukTokoTampil (MITIGASI SEMENTARA umkm-detail-toko)', () => {
  it('aktif tampil; kolom kosong = aktif', () => {
    expect(isTokoTampil(toko())).toBe(true);
    expect(isTokoTampil(toko({ isActive: null }))).toBe(true);
    expect(isProdukTokoTampil(produk({ isActive: null }))).toBe(true);
  });

  it.each([
    ['terhapus', { deletedAt: '2026-11-01T00:00:00.000Z' }],
    ['nonaktif', { isActive: false }],
  ])('%s → tidak tampil', (_, over) => {
    expect(isTokoTampil(toko(over))).toBe(false);
    expect(isProdukTokoTampil(produk(over))).toBe(false);
  });
});

describe('toDetailToko', () => {
  const sanitize = (html: string) => `[clean]${html}`;

  it('memetakan kolom toko + produk ke bentuk kartu katalog (umkm = toko ini, kategori null)', () => {
    expect(toDetailToko(toko(), sanitize)).toEqual({
      id: 'umkm-3',
      nama: 'Sayur Segar Pak Wayan',
      pemilik: 'Wayan',
      alamat: 'Br. Tengah',
      kontak: '081234567890',
      deskripsiHtml: '[clean]<p>Sayur pagi</p>',
      fotoUrl: '/api/img/toko.webp',
      kategori: { id: 'k1', nama: 'Pertanian' },
      produk: [
        {
          id: 'prd-1',
          nama: 'Bayam',
          harga: 5000,
          satuan: 'ikat',
          stok: 10,
          isUnggulan: false,
          createdAt: '2026-11-01T00:00:00.000Z',
          imageUrl: '/api/img/bayam.webp',
          umkm: { id: 'umkm-3', nama: 'Sayur Segar Pak Wayan' },
          kategori: null,
        },
      ],
    });
  });

  it('produk nonaktif/terhapus disembunyikan; produk null → []', () => {
    const d = toDetailToko(
      toko({ produk: [produk({ id: 'a' }), produk({ id: 'b', isActive: false }), produk({ id: 'c', deletedAt: '2026-11-02' })] }),
      sanitize,
    );
    expect(d.produk.map((p) => p.id)).toEqual(['a']);
    expect(toDetailToko(toko({ produk: null }), sanitize).produk).toEqual([]);
  });

  it('kolom kosong/spasi → null; tanpa foto/kategori → null; deskripsi kosong → "" tanpa sanitize', () => {
    const spy = vi.fn(sanitize);
    const d = toDetailToko(
      toko({ pemilik: ' ', alamat: '', kontak: null, image: { link: '  ' }, kategori: null, deskripsi: null }),
      spy,
    );
    expect(d).toMatchObject({ pemilik: null, alamat: null, kontak: null, fotoUrl: null, kategori: null, deskripsiHtml: '' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('sanitize bawaan (DOMPurify) di lingkungan tanpa DOM → "" (deskripsi HTML tidak dirender mentah)', () => {
    expect(toDetailToko(toko({ deskripsi: '<img src=x onerror=alert(1)>' })).deskripsiHtml).toBe('');
  });
});

describe('loadDetailToko', () => {
  beforeEach(() => {
    h.ids = [];
  });

  it('memanggil endpoint per id dan mengembalikan bentuk halaman', async () => {
    h.res = { status: 200, data: { success: true, data: toko() } };
    const d = await loadDetailToko('umkm-3');
    expect(h.ids).toEqual(['umkm-3']);
    expect(d?.nama).toBe('Sayur Segar Pak Wayan');
  });

  it('toko nonaktif, terhapus, atau "tidak ditemukan" → null (halaman notFound)', async () => {
    h.res = { status: 200, data: { success: true, data: toko({ isActive: false }) } };
    expect(await loadDetailToko('umkm-3')).toBeNull();
    h.res = { status: 200, data: { success: true, data: toko({ deletedAt: '2026-11-01' }) } };
    expect(await loadDetailToko('umkm-3')).toBeNull();
    h.res = { status: 200, data: { success: false, message: 'UMKM tidak ditemukan' } };
    expect(await loadDetailToko('umkm-3')).toBeNull();
  });

  it('galat server → reject berkonteks', async () => {
    h.res = { status: 200, data: { success: false, message: 'Gagal mengambil detail UMKM' } };
    await expect(loadDetailToko('umkm-3')).rejects.toThrow(/umkm-3/);
  });
});

describe('pesan WhatsApp toko (tanpa produkNama)', () => {
  it('pesan umum tentang toko', () => {
    expect(buildHubungiPenjualMessage({ umkmNama: 'Sayur Segar Pak Wayan' })).toBe(
      'Halo *Sayur Segar Pak Wayan*, saya melihat toko Anda di website Desa Darmasaba dan ingin bertanya tentang produknya.',
    );
    expect(buildHubungiPenjualMessage({ umkmNama: null })).toMatch(/^Halo \*Penjual\*, saya melihat toko Anda/);
  });

  it('pesan dengan produk tidak berubah', () => {
    expect(buildHubungiPenjualMessage({ umkmNama: 'Warung', produkNama: 'Keripik' })).toBe(
      'Halo *Warung*, saya tertarik dengan produk *Keripik*. Apakah masih tersedia?',
    );
  });

  it('URL wa.me toko: nomor ternormalisasi + pesan toko; nomor tidak valid → null', () => {
    const url = new URL(buildHubungiPenjualUrl({ kontak: '0812-3456-7890', umkmNama: 'Toko A' }) as string);
    expect(url.pathname).toBe('/6281234567890');
    expect(url.searchParams.get('text')).toContain('saya melihat toko Anda');
    expect(buildHubungiPenjualUrl({ kontak: '0361 123456', umkmNama: 'Toko A' })).toBeNull();
  });
});
