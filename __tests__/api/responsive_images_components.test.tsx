// @vitest-environment node
// Juknis lomba 5.4: foto di bawah lipatan lazy; srcset/sizes hanya untuk foto besar /api/img; foto atas-lipatan
// tidak lazy. Render server (jsdom di project ini rusak) → hanya atribut HTML yang diuji.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes, ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
import { KabarBerita } from '@/app/(public)/_com/main-page/kabar-desa/KabarBerita';
import type { KabarItem } from '@/app/(public)/_com/main-page/kabar-desa/kabar.logic';
import { GalleryRow, type GalleryItem } from '@/app/(public)/_com/main-page/layanan-potensi/GalleryRow';
import type { LoopCarousel } from '@/app/(public)/_com/main-page/layanan-potensi/use-loop-carousel';
import { PrestasiGrid } from '@/app/(public)/_com/main-page/prestasi/PrestasiGrid';
import type { PrestasiItem } from '@/app/(public)/_com/main-page/prestasi/prestasi.logic';
import { SdgsCards } from '@/app/(public)/_com/main-page/sdgs/SdgsCards';
import type { SdgsItem } from '@/app/(public)/_com/main-page/sdgs/sdgs.logic';

const render = (node: ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

/** Semua tag <img> pada markup. */
const imgs = (html: string) => html.match(/<img[^>]*>/g) ?? [];
/** Tag <img> yang `src`-nya persis `src`. */
const imgTag = (html: string, src: string) => imgs(html).find((t) => t.includes(`src="${src}"`)) ?? '';

const full = (id: string) => `/api/img/${id}-desktop.webp`;

describe('KabarBerita — srcset/sizes', () => {
  // test-only: berita dengan foto.
  const item = (id: string, imageUrl?: string): KabarItem => ({
    id,
    title: `Berita ${id}`,
    summary: 'Ringkasan',
    kategori: 'Budaya',
    createdAt: Date.UTC(2026, 10, 3, 2),
    href: `/berita/${id}`,
    imageUrl: imageUrl ?? full(id),
  });
  const items = [item('a'), item('b'), item('c')];

  it('beranda (rail): semua foto lazy + decoding async, srcset 480/768/1280, sizes sesuai kartu', () => {
    const html = render(<KabarBerita items={items} loading={false} />);
    const tags = imgs(html);
    expect(tags).toHaveLength(3);
    for (const tag of tags) {
      expect(tag).toContain('loading="lazy"');
      expect(tag).toContain('decoding="async"');
      expect(tag).toContain('?size=480 480w, ');
      expect(tag).toContain('?size=1280 1280w"');
    }
    expect(imgTag(html, full('a'))).toContain('sizes="(max-width: 734px) 100vw, 60vw"');
    expect(imgTag(html, full('b'))).toContain('sizes="(max-width: 734px) 87vw, 38vw"');
  });

  it('halaman daftar (grid): berita utama eager TANPA lazy, kartu kecil lazy, sizes grid', () => {
    const html = render(<KabarBerita items={items} loading={false} layout="grid" />);
    const featured = imgTag(html, full('a'));
    expect(featured).toContain('loading="eager"');
    expect(featured).toContain('fetchPriority="high"');
    expect(featured).not.toContain('loading="lazy"');
    expect(imgTag(html, full('b'))).toContain('loading="lazy"');
    expect(imgTag(html, full('b'))).toContain('sizes="(max-width: 734px) 111vw, (max-width: 1068px) 56vw, 38vw"');
  });

  it('URL eksternal atau ber-query: tanpa srcset/sizes', () => {
    const external = 'https://cdn.example.com/foto.jpg';
    const queried = '/api/img/z-desktop.webp?size=300';
    const html = render(<KabarBerita items={[item('a'), item('b', external), item('c', queried)]} loading={false} />);
    for (const src of [external, queried]) {
      const tag = imgTag(html, src);
      expect(tag).toContain('loading="lazy"');
      expect(tag).not.toContain('srcSet');
      expect(tag).not.toContain('sizes=');
    }
  });
});

describe('PrestasiGrid — srcset/sizes', () => {
  // test-only: kartu prestasi.
  const card = (id: string): PrestasiItem => ({
    id,
    source: 'prestasi',
    name: `Prestasi ${id}`,
    imageUrl: full(id),
    createdAt: 1,
    href: `/prestasi/${id}`,
  });

  it('semua foto lazy + decoding async + srcset; kartu wide (ganjil terakhir) memakai sizes selebar baris', () => {
    const html = render(<PrestasiGrid cards={[card('a'), card('b'), card('c')]} loading={false} placeholderCount={3} />);
    expect(imgs(html)).toHaveLength(3);
    for (const tag of imgs(html)) {
      expect(tag).toContain('loading="lazy"');
      expect(tag).toContain('decoding="async"');
      expect(tag).toContain('?size=768 768w');
    }
    expect(imgTag(html, full('a'))).toContain('sizes="(max-width: 734px) 134vw, 56vw"');
    expect(imgTag(html, full('c'))).toContain('sizes="(max-width: 734px) 134vw, 100vw"');
  });
});

describe('GalleryRow — lazy + srcset', () => {
  // test-only: baris galeri 3 item → track 5 salinan (15 kartu), kartu aktif di indeks track 6.
  const items: GalleryItem[] = ['a', 'b', 'c'].map((id) => ({ id, name: id, imageUrl: full(id), href: `/x/${id}` }));
  const carousel = { index: 6, animate: false, active: 0, position: 0, step: vi.fn(), goTo: vi.fn(), settle: vi.fn() } as LoopCarousel;
  const row = (variant: 'feature' | 'tile', preloadImages: boolean) =>
    render(
      <GalleryRow label="Baris" variant={variant} items={items} carousel={carousel} ctaLabel="Buka" preloadImages={preloadImages} onStep={vi.fn()} />,
    );
  const countLoading = (html: string, loading: 'eager' | 'lazy') => imgs(html).filter((t) => t.includes(`loading="${loading}"`)).length;

  it('section belum mendekati layar: seluruh 15 foto lazy, tidak ada yang eager', () => {
    const html = row('feature', false);
    expect(imgs(html)).toHaveLength(15);
    expect(countLoading(html, 'lazy')).toBe(15);
    expect(countLoading(html, 'eager')).toBe(0);
  });

  it('section mendekati layar: feature aktif ±2 = 5 eager, sisanya lazy', () => {
    const html = row('feature', true);
    expect(countLoading(html, 'eager')).toBe(5);
    expect(countLoading(html, 'lazy')).toBe(10);
  });

  it('section mendekati layar: tile aktif ±4 = 9 eager, sisanya lazy', () => {
    const html = row('tile', true);
    expect(countLoading(html, 'eager')).toBe(9);
    expect(countLoading(html, 'lazy')).toBe(6);
  });

  it('semua foto: decoding async, srcset, sizes per varian; tidak ada fetchpriority', () => {
    const feature = row('feature', true);
    for (const tag of imgs(feature)) {
      expect(tag).toContain('decoding="async"');
      expect(tag).toContain('?size=480 480w');
      expect(tag).toContain('sizes="(max-width: 734px) 220vw, (max-width: 1068px) 64vw, 49vw"');
    }
    expect(row('tile', false)).toContain('sizes="(max-width: 734px) 112vw, (max-width: 1068px) 28vw, 18.4vw"');
    expect(feature).not.toContain('fetchPriority');
  });
});

describe('SdgsCards — ikon kecil', () => {
  it('ikon 72px: lazy dan tetap satu URL (tanpa srcset)', () => {
    // test-only: satu tujuan SDGs.
    const item: SdgsItem = { id: '1', name: 'Tanpa Kemiskinan', skorLabel: '99', skor: 99, imageUrl: full('sdg') };
    const tag = imgTag(render(<SdgsCards items={[item]} />), full('sdg'));
    expect(tag).toContain('loading="lazy"');
    expect(tag).not.toContain('srcSet');
  });
});
