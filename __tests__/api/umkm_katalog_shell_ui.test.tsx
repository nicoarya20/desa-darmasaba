// @vitest-environment node
// Kerangka katalog UMKM: tab, panel saring (grup Decathlon), baris alat (jumlah, urutkan, chip), keadaan badan.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup; interaksi (klik, drawer) diverifikasi manual.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

import { KatalogBody } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/KatalogBody';
import { produkFacets, tokoFacets, activeChips } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-filter.logic';
import { emptyParams, type KatalogParams } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-params.logic';
import l from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-layout.module.css';
import type { KatalogProduk, KatalogToko } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/katalog.types';
import { KatalogTabs } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/KatalogTabs';
import { KatalogToolbar } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/KatalogToolbar';
import { SaringPanel } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/SaringPanel';
import s from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/saring.module.css';
import type { KatalogData } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/use-katalog-data';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const count = (html: string, needle: string) => html.split(needle).length - 1;
const noop = () => {};

// test-only: 7 produk dari 7 toko (lebih dari 5 → "Lihat semua"), 2 kategori.
const produk: KatalogProduk[] = Array.from({ length: 7 }, (_, i) => ({
  id: `p${i}`,
  nama: `Produk ${i}`,
  harga: (i + 1) * 10000,
  satuan: null,
  stok: i === 0 ? 0 : 3,
  isUnggulan: false,
  createdAt: `2026-11-0${i + 1}T00:00:00.000Z`,
  imageUrl: null,
  umkm: { id: `u${i}`, nama: `Toko ${i}` },
  kategori: i < 3 ? { id: 'k1', nama: 'Makanan' } : { id: 'k2', nama: 'Kerajinan' },
}));
const toko: KatalogToko[] = [
  { id: 'u0', nama: 'Toko 0', pemilik: 'Made', alamat: null, imageUrl: null, kategori: { id: 'k1', nama: 'Makanan' }, createdAt: '2026-11-01T00:00:00.000Z' },
];
const data: KatalogData = { produk, toko };
const ready = { status: 'ready' as const, data };
const params = (over: Partial<KatalogParams> = {}): KatalogParams => ({ ...emptyParams('produk'), ...over });
const body = (state: Parameters<typeof KatalogBody>[0]['state'], p = params()) =>
  render(<KatalogBody state={state} params={p} update={noop} onRetry={noop} />);

describe('KatalogTabs', () => {
  it('tablist dengan tab aktif aria-selected & tabindex 0', () => {
    const html = render(<KatalogTabs value="toko" onChange={noop} />);
    expect(html).toContain('role="tablist"');
    expect(count(html, 'role="tab"')).toBe(2);
    expect(html).toMatch(/id="katalog-tab-toko"[^>]*aria-selected="true"[^>]*tabindex="0"/);
    expect(html).toMatch(/id="katalog-tab-produk"[^>]*aria-selected="false"[^>]*tabindex="-1"/);
    expect(text(html)).toBe('Produk Toko');
  });
});

describe('SaringPanel', () => {
  it('tab Produk: judul h2, 5 grup, Kategori & Toko terbuka bawaan, jumlah per pilihan', () => {
    const html = render(<SaringPanel params={params()} facets={produkFacets(produk)} update={noop} withTitle />);
    expect(html).toContain(`<h2 class="${s.title}">`);
    const heads = [...html.matchAll(/aria-expanded="(true|false)"[^>]*>([\s\S]*?)<\/button>/g)].map((m) => [text(m[2]), m[1]]);
    expect(heads).toEqual([
      ['Kategori', 'true'],
      ['Toko', 'true'],
      ['Harga', 'false'],
      ['Ketersediaan', 'false'],
      ['Produk unggulan', 'false'],
    ]);
    expect(text(html)).toContain('Kerajinan 4 Makanan 3');
    expect(text(html)).toContain('Hanya yang tersedia 6');
  });

  it('Toko > 5 → 5 pilihan + "Lihat semua (7)"; pilihan tercentang di luar batas tetap tampil', () => {
    const html = render(<SaringPanel params={params({ toko: ['u6'] })} facets={produkFacets(produk)} update={noop} />);
    expect(text(html)).toContain('Lihat semua (7)');
    expect(text(html)).toContain('Toko 4');
    expect(text(html)).not.toContain('Toko 5');
    expect(text(html)).toContain('Toko 6');
  });

  it('6 toko (hanya 1 yang akan tersembunyi) → semua tampil tanpa "Lihat semua"', () => {
    const html = render(<SaringPanel params={params()} facets={produkFacets(produk.slice(0, 6))} update={noop} />);
    expect(text(html)).not.toContain('Lihat semua');
    expect(text(html)).toContain('Toko 5');
  });

  it('grup dengan nilai aktif dari URL terbuka saat dirender', () => {
    const html = render(<SaringPanel params={params({ min: 5000, tersedia: true })} facets={produkFacets(produk)} update={noop} />);
    const heads = [...html.matchAll(/aria-expanded="(true|false)"[^>]*>([\s\S]*?)<\/button>/g)].map((m) => [text(m[2]), m[1]]);
    expect(heads).toEqual([
      ['Kategori', 'true'],
      ['Toko', 'true'],
      ['Harga 1', 'true'],
      ['Ketersediaan 1', 'true'],
      ['Produk unggulan', 'false'],
    ]);
  });

  it('angka kecil di grup yang aktif; unggulan 0 → nonaktif', () => {
    const html = render(<SaringPanel params={params({ kategori: ['k1', 'k2'], min: 5000 })} facets={produkFacets(produk)} update={noop} />);
    expect(html).toContain(`Kategori<span class="${s.groupBadge}">2</span>`);
    expect(html).toContain(`Harga<span class="${s.groupBadge}">1</span>`);
    expect(html).toMatch(/data-disabled="true"[^>]*><input type="checkbox"[^>]*disabled=""/);
    expect(html).toContain('placeholder="Harga minimum"');
    expect(html).toContain('value="5.000"');
  });

  it('tab Toko: hanya grup Kategori usaha', () => {
    const html = render(<SaringPanel params={emptyParams('toko')} facets={tokoFacets(toko)} update={noop} />);
    expect(count(html, 'aria-expanded=')).toBe(1);
    expect(text(html)).toBe('Kategori usaha Makanan 1');
  });

  it('facets null → kerangka memuat', () => {
    const html = render(<SaringPanel params={params()} facets={null} update={noop} />);
    expect(html).toContain('aria-busy="true"');
    expect(count(html, s.skeletonRow)).toBe(4);
  });
});

describe('KatalogToolbar', () => {
  const toolbar = (over: Partial<Parameters<typeof KatalogToolbar>[0]> = {}) =>
    render(
      <KatalogToolbar tab="produk" count={{ shown: 7, total: 7 }} urut="terbaru" onUrut={noop} chips={[]} activeCount={0}
        onApply={noop} onClearAll={noop} onOpenSaring={noop} {...over} />,
    );

  it('jumlah: semua vs. sebagian', () => {
    expect(toolbar()).toContain('Menampilkan <strong>7</strong> produk');
    expect(toolbar({ tab: 'toko', count: { shown: 3, total: 8 } })).toContain('Menampilkan <strong>3</strong> dari 8 toko');
    expect(text(toolbar({ count: null }))).not.toContain('Menampilkan');
  });

  it('Urutkan menampilkan label urutan aktif; pil Saring dengan badge', () => {
    const html = toolbar({ urut: 'harga-asc', activeCount: 2 });
    expect(html).toContain('value="Harga terendah"');
    expect(html).toContain('>Urutkan</label>');
    expect(html).toContain(`class="${l.saringPill}"`);
    expect(html).toContain('aria-label="2 saringan aktif"');
  });

  it('chip aktif + "Hapus semua" hanya bila ada saringan', () => {
    expect(toolbar()).not.toContain('Hapus semua');
    const p = params({ kategori: ['k1'], tersedia: true });
    const html = toolbar({ chips: activeChips(p, produkFacets(produk)), activeCount: 2 });
    expect(html).toContain('aria-label="Hapus saringan Makanan"');
    expect(html).toContain('aria-label="Hapus saringan Tersedia"');
    expect(text(html)).toContain('Hapus semua');
  });
});

describe('KatalogBody', () => {
  it('memuat: kerangka panel + grid aria-busy, tanpa jumlah', () => {
    const html = body({ status: 'loading' });
    expect(count(html, 'aria-busy="true"')).toBe(2);
    expect(text(html)).not.toContain('Menampilkan');
    expect(html).toContain('role="tabpanel"');
    expect(html).toContain('aria-labelledby="katalog-tab-produk"');
  });

  it('galat: pesan + Muat ulang, tanpa grid', () => {
    const html = body({ status: 'error' });
    expect(text(html)).toContain('Katalog belum dapat dimuat');
    expect(text(html)).toContain('Muat ulang');
    expect(text(html)).not.toContain('Menampilkan');
  });

  it('siap: h2 tersembunyi, kartu produk menaut ke detail, urut terbaru', () => {
    const html = body(ready);
    expect(html).toContain(`<h2 id="katalog-list-title" class="${l.srOnly}">Daftar produk</h2>`);
    expect(count(html, 'href="/ekonomi/umkm/produk/')).toBe(7);
    expect(html.indexOf('/produk/p6')).toBeLessThan(html.indexOf('/produk/p0'));
    expect(html).toContain('Menampilkan <strong>7</strong> produk');
  });

  it('saringan diterapkan + id tak dikenal diabaikan', () => {
    const html = body(ready, params({ kategori: ['k1', 'asing'], tersedia: true }));
    expect(html).toContain('Menampilkan <strong>2</strong> dari 7 produk');
    expect(count(html, 'href="/ekonomi/umkm/produk/')).toBe(2);
    expect(html).not.toContain('Hapus saringan asing');
  });

  it('hasil saring kosong vs. data kosong', () => {
    const filtered = text(body(ready, params({ q: 'tidak ada' })));
    expect(filtered).toContain('Tidak ada produk yang cocok');
    expect(filtered).toContain('Hapus semua saringan');
    const none = text(body({ status: 'ready', data: { produk: [], toko: [] } }));
    expect(none).toContain('Belum ada produk UMKM');
    expect(none).not.toContain('Hapus semua saringan');
  });

  it('tab Toko: kartu toko + jumlah produk', () => {
    const html = body(ready, emptyParams('toko'));
    expect(html).toContain('href="/ekonomi/umkm/u0"');
    expect(text(html)).toContain('1 produk');
    expect(html).toContain('>Daftar toko</h2>');
  });
});
