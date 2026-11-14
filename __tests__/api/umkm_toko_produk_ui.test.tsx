// @vitest-environment node
// Daftar produk detail toko UMKM: judul + jumlah, Urutkan (≥ 2 produk), grid ProdukCard, keadaan kosong, tanpa stok.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup; ganti urutan diuji di umkm_toko_produk_logic.test.ts.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

import { TokoProduk } from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-toko/TokoProduk';
import s from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-toko/toko-produk.module.css';
import g from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-grid.module.css';
import u from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-urut.module.css';
import type { KatalogProduk } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog.types';
import { KatalogUrutSelect } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/KatalogUrutSelect';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const count = (html: string, needle: string) => html.split(needle).length - 1;
const hrefs = (html: string) => [...html.matchAll(/href="\/ekonomi\/umkm\/produk\/([^"]+)"/g)].map((m) => m[1]);

// test-only
const produk = (id: string, harga: number, tgl: string, stok = 7): KatalogProduk => ({
  id,
  nama: `Produk ${id}`,
  harga,
  satuan: 'ikat',
  stok,
  isUnggulan: false,
  createdAt: `2026-11-${tgl}T00:00:00.000Z`,
  imageUrl: null,
  umkm: { id: 'u1', nama: 'Sayur Segar Pak Wayan' },
  kategori: null,
});
const tiga = [produk('a', 20000, '02'), produk('b', 5000, '05'), produk('c', 12000, '01')];

describe('TokoProduk', () => {
  it('judul h2 "Produk" + jumlah "N produk" + section berlabel judul', () => {
    const html = render(<TokoProduk produk={tiga} />);
    const id = html.match(/<h2 id="([^"]+)"/)?.[1];
    expect(id).toBeTruthy();
    expect(html).toContain(`<section class="${s.section}" aria-labelledby="${id}">`);
    expect(html).toMatch(/<h2 [^>]*>Produk<\/h2>/);
    expect(html).toContain(`<p class="${s.count}">3 produk</p>`);
  });

  it('grid ProdukCard berurutan terbaru (bawaan), Urutkan tampil dengan nilai "Terbaru"', () => {
    const html = render(<TokoProduk produk={tiga} />);
    expect(count(html, `class="${g.item}"`)).toBe(3);
    expect(hrefs(html)).toEqual(['b', 'a', 'c']);
    expect(html).toContain(`class="${s.urut}"`);
    expect(html).toContain('>Urutkan</label>');
    expect(html).toContain('value="Terbaru"');
  });

  it('1 produk → kartu tampil, Urutkan disembunyikan', () => {
    const html = render(<TokoProduk produk={[produk('a', 20000, '02')]} />);
    expect(hrefs(html)).toEqual(['a']);
    expect(html).toContain('1 produk');
    expect(html).not.toContain(`class="${s.urut}"`);
    expect(html).not.toContain('Urutkan');
  });

  it('kosong → KatalogEmpty tanpa tombol, tanpa jumlah dan Urutkan', () => {
    const html = render(<TokoProduk produk={[]} />);
    expect(html).toContain(`<p class="${g.emptyTitle}">Toko ini belum menambahkan produk.</p>`);
    expect(html).not.toContain('<button');
    expect(html).not.toContain(`class="${s.count}"`);
    expect(html).not.toContain('Urutkan');
    expect(html).not.toContain(`class="${g.grid}"`);
  });

  it('stok tidak tampil, termasuk stok 0', () => {
    const html = render(<TokoProduk produk={[produk('a', 20000, '02', 0), produk('b', 5000, '05', 12)]} />);
    expect(text(html).toLowerCase()).not.toContain('stok');
    expect(text(html)).not.toMatch(/\bhabis\b/i);
  });
});

describe('KatalogUrutSelect', () => {
  it('label terhubung ke input Select dan memakai pilihan tab', () => {
    const html = render(<KatalogUrutSelect tab="toko" value="nama" onChange={() => {}} />);
    const id = html.match(/<label for="([^"]+)" class="([^"]+)">Urutkan<\/label>/);
    expect(id?.[2]).toBe(u.label);
    expect(html).toContain(`id="${id?.[1]}"`);
    expect(html).toContain('value="Nama A–Z"');
  });
});
