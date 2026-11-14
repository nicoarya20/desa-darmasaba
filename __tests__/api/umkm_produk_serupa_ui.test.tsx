// @vitest-environment node
// Rel Produk serupa di detail produk UMKM: kerangka, galat + coba lagi, hasil 0 → tidak dirender, kartu katalog.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup; data dari hook di-mock.
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LoadState } from '@/app/(public)/_com/lazy-load/use-lazy-load';
import type { KatalogProduk } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog.types';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

const hook = vi.hoisted(() => ({
  state: { status: 'loading' } as LoadState<KatalogProduk[]>,
  retry: () => {},
}));
const useProdukSerupa = vi.hoisted(() => vi.fn(() => hook));
vi.mock('@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/use-produk-serupa', () => ({ useProdukSerupa }));

import { ProdukSerupa } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/ProdukSerupa';
import s from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/produk-serupa.module.css';
import { PRODUK_SERUPA_TEXT as T } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-produk/produk-serupa.text';

const current = { id: 'p1', kategoriNama: 'Makanan', umkmId: 'u1' }; // test-only
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const count = (html: string, needle: string) => html.split(needle).length - 1;

// test-only
const produk = (id: string): KatalogProduk => ({
  id,
  nama: `Produk ${id}`,
  harga: 15000,
  satuan: 'bungkus',
  stok: 2,
  isUnggulan: false,
  createdAt: '2026-11-01T00:00:00.000Z',
  imageUrl: null,
  umkm: { id: 'u2', nama: 'Warung Sari' },
  kategori: { id: 'k1', nama: 'Makanan' },
});

beforeEach(() => {
  useProdukSerupa.mockClear();
});

describe('ProdukSerupa', () => {
  it('meneruskan produk acuan ke hook', () => {
    hook.state = { status: 'loading' };
    renderToStaticMarkup(<ProdukSerupa current={current} />);
    expect(useProdukSerupa).toHaveBeenCalledWith(current);
  });

  it('memuat → judul + 4 kerangka kartu, tanpa jumlah', () => {
    hook.state = { status: 'loading' };
    const html = renderToStaticMarkup(<ProdukSerupa current={current} />);
    expect(html).toMatch(/<h2 [^>]*>Produk serupa<\/h2>/);
    expect(html).toContain(`aria-label="${T.memuat}"`);
    expect(count(html, `class="${s.skeletonMedia}"`)).toBe(4);
    expect(html).not.toContain(`class="${s.count}"`);
  });

  it('galat → pesan + tombol "Coba lagi"', () => {
    hook.state = { status: 'error' };
    const html = renderToStaticMarkup(<ProdukSerupa current={current} />);
    expect(text(html)).toContain('Produk serupa gagal dimuat.');
    expect(html).toMatch(/<button type="button"[^>]*>Coba lagi<\/button>/);
  });

  it('hasil 0 → section tidak dirender', () => {
    hook.state = { status: 'ready', data: [] };
    expect(renderToStaticMarkup(<ProdukSerupa current={current} />)).toBe('');
  });

  it('siap → jumlah "N produk" + satu ProdukCard per item di rel', () => {
    hook.state = { status: 'ready', data: [produk('p2'), produk('p3'), produk('p4')] };
    const html = renderToStaticMarkup(<ProdukSerupa current={current} />);
    expect(html).toContain(`<p class="${s.count}">3 produk</p>`);
    expect(count(html, `class="${s.item}"`)).toBe(3);
    expect(html).toContain('href="/ekonomi/umkm/produk/p2"');
    expect(html).toContain('href="/ekonomi/umkm/produk/p4"');
    expect(html).toMatch(/<ul class="[^"]*" aria-labelledby="produk-serupa-judul">/);
  });
});
