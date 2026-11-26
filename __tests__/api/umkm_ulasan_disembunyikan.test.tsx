// @vitest-environment node
// Ulasan produk UMKM disembunyikan sementara (src/con/umkm-ulasan.ts): tanpa bagian Ulasan di detail produk, tanpa
// tautan rating ke #ulasan, dan tanpa baris "Belum ada ulasan" di kartu produk. Konstanta asli (tidak di-mock).
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { DetailProduk, DetailProdukState } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/detail-produk.types';

const h = vi.hoisted(() => ({ state: { status: 'loading' } as DetailProdukState }));

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock('@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/use-detail-produk', () => ({
  useDetailProduk: () => ({ state: h.state, reload: () => undefined }),
}));
vi.mock('@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/ProdukSerupa', () => ({
  ProdukSerupa: () => <section data-testid="produk-serupa" />,
}));

import { ULASAN_PRODUK_UMKM_TAMPIL } from '@/con/umkm-ulasan';
import { DetailProdukView } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/DetailProdukView';
import { ProdukInfo } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/ProdukInfo';
import inf from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/info.module.css';
import { ProdukCard } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/ProdukCard';
import pc from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/produk-card.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// test-only: bentuk hasil adapter.
const produk: DetailProduk = {
  id: 'prd-1',
  nama: 'Keripik Pisang',
  harga: 15000,
  satuan: 'bungkus',
  isUnggulan: false,
  deskripsiHtml: '<p>Renyah</p>',
  fotos: [],
  kategori: { id: 'k1', nama: 'Makanan' },
  penjual: { id: 'u1', nama: 'Warung Bu Made', pemilik: null, alamat: null, kontak: '081234567890' },
  alamat: null,
  linkTokoOnline: [],
  stok: 3,
};

describe('ulasan produk UMKM disembunyikan', () => {
  it('bawaan di kode false', () => {
    expect(ULASAN_PRODUK_UMKM_TAMPIL).toBe(false);
    const source = readFileSync(path.resolve(__dirname, '../../src/con/umkm-ulasan.ts'), 'utf8');
    expect(source).toContain('export const ULASAN_PRODUK_UMKM_TAMPIL = false;');
  });

  it('detail produk: tanpa bagian Ulasan, Produk serupa tetap tampil', () => {
    h.state = { status: 'ready', data: produk };
    const html = render(<DetailProdukView id="prd-1" />);
    expect(html).not.toContain('id="ulasan"');
    expect(text(html)).not.toMatch(/Ulasan|Tulis ulasan/);
    expect(html).toContain('data-testid="produk-serupa"');
  });

  it('kolom info: tanpa tautan rating ke #ulasan, harga & nama tetap', () => {
    const html = render(<ProdukInfo produk={produk} onTercatat={() => undefined} />);
    expect(html).not.toContain('href="#ulasan"');
    expect(html).not.toContain(inf.rating);
    expect(text(html)).toContain('Rp15.000 / bungkus');
  });

  it('kartu produk: tanpa baris "Belum ada ulasan"', () => {
    const kartu = { ...produk, stok: 3, createdAt: '2026-11-01', imageUrl: null, umkm: { id: 'u1', nama: 'Warung Bu Made' } };
    const html = render(<ProdukCard produk={kartu} />);
    expect(html).not.toContain(pc.rating);
    expect(text(html)).toBe('Rp15.000 / bungkus Keripik Pisang Warung Bu Made');
  });
});
