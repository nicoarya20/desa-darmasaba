// @vitest-environment node
// Juknis lomba 5.4 (kecepatan): gambar di atas lipatan (kandidat LCP) tidak boleh lazy dan diberi
// fetchpriority=high; gambar di bawah lipatan tetap lazy.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import type { AnchorHTMLAttributes } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
import { imageLoadingAttrs } from '@/app/(public)/_com/image-loading.logic';
import { KabarBerita } from '@/app/(public)/_com/main-page/kabar-desa/KabarBerita';
import type { KabarItem } from '@/app/(public)/_com/main-page/kabar-desa/kabar.logic';
import { HeroProfile } from '@/app/(public)/_com/main-page/landing-page/HeroProfile';
import type { PejabatItem } from '@/app/(public)/_com/main-page/landing-page/use-landing-data';

// test-only: entri berita dengan foto.
const item = (id: string): KabarItem => ({
  id,
  title: `Berita ${id}`,
  summary: 'Ringkasan',
  kategori: 'Budaya',
  createdAt: Date.UTC(2026, 10, 3, 2),
  href: `/pemerintahan/berita/Budaya/${id}`,
  imageUrl: `/api/img/${id}-desktop.webp`,
});

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

/** Tag <img> yang memuat `src` tertentu. */
const imgTag = (html: string, src: string) => html.match(new RegExp(`<img[^>]*src="${src}"[^>]*>`))?.[0] ?? '';

describe('imageLoadingAttrs', () => {
  it('di atas lipatan: eager + fetchPriority high', () => {
    expect(imageLoadingAttrs(true)).toEqual({ loading: 'eager', fetchPriority: 'high' });
  });

  it('di bawah lipatan: lazy tanpa fetchPriority', () => {
    expect(imageLoadingAttrs(false)).toEqual({ loading: 'lazy' });
  });
});

describe('KabarBerita — foto berita utama', () => {
  const items = ['a', 'b', 'c'].map(item);

  it('grid (halaman daftar): foto berita utama eager + fetchpriority=high, kartu kecil tetap lazy', () => {
    const html = render(<KabarBerita items={items} loading={false} layout="grid" />);
    const featured = imgTag(html, '/api/img/a-desktop.webp');
    expect(featured).toContain('loading="eager"');
    expect(featured).toContain('fetchPriority="high"');
    expect(featured).not.toContain('loading="lazy"');
    expect(imgTag(html, '/api/img/b-desktop.webp')).toContain('loading="lazy"');
    expect(imgTag(html, '/api/img/c-desktop.webp')).toContain('loading="lazy"');
  });

  it('rail (beranda, di bawah lipatan): semua foto tetap lazy', () => {
    const html = render(<KabarBerita items={items} loading={false} />);
    expect(imgTag(html, '/api/img/a-desktop.webp')).toContain('loading="lazy"');
    expect(html).not.toContain('fetchPriority');
  });
});

describe('HeroProfile — foto Perbekel (LCP beranda)', () => {
  // test-only: data pejabat minimal.
  const data = {
    name: 'I.B. Contoh',
    position: 'Perbekel',
    image: { link: '/api/img/perbekel-desktop.webp' },
  } as unknown as PejabatItem;

  it('foto dimuat eager dengan fetchpriority=high', () => {
    const photo = imgTag(render(<HeroProfile data={data} />), '/api/img/perbekel-desktop.webp');
    expect(photo).toContain('loading="eager"');
    expect(photo).toContain('fetchPriority="high"');
  });
});
