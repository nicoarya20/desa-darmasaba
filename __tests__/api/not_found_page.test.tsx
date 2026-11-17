// @vitest-environment node
// Halaman 404 situs (src/app/not-found.tsx): pola apple.com — judul + kolom cari + tautan Peta Informasi di dalam
// navbar/footer publik, tanpa angka 404; menu tersembunyi dari DB ikut diterapkan.
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';

const db = vi.hoisted(() => ({ overrides: {} as Record<string, boolean> }));

vi.mock('next/server', () => ({ connection: async () => undefined }));
// Link view-transition butuh provider root layout; di test cukup <a> biasa.
vi.mock('next-view-transitions', () => ({
  Link: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock('@/lib/menu-visibility.server', () => ({ getMenuVisibilityOverrides: async () => db.overrides }));
// Navbar/footer sudah dites di tempat lain; shell diganti penanda supaya pembungkusnya bisa dicek.
vi.mock('@/app/(public)/_com/DarmasabaShell', () => ({
  DarmasabaShell: ({ children }: { children: React.ReactNode }) => <div data-shell="publik">{children}</div>,
}));

import NotFound, { metadata } from '@/app/not-found';
import GlobalSearch from '@/app/(public)/_com/globalSearch';
import { NotFoundContent } from '@/app/(public)/_com/not-found/NotFoundContent';
import { NOT_FOUND_TEXT } from '@/app/(public)/_com/not-found/not-found.text';
import { useMenuVisibility } from '@/app/(public)/_com/MenuVisibilityContext';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

describe('NotFoundContent', () => {
  const html = render(<NotFoundContent />);

  it('menampilkan satu judul h1 "Halaman yang Anda cari tidak ditemukan."', () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(`>${NOT_FOUND_TEXT.title}</h1>`);
    expect(NOT_FOUND_TEXT.title).toBe('Halaman yang Anda cari tidak ditemukan.');
  });

  it('kolom cari besar berlabel, memakai pencarian situs yang sama dengan navbar', () => {
    const input = html.match(/<input[^>]*>/g) ?? [];
    expect(input).toHaveLength(1);
    expect(input[0]).toContain(`placeholder="${NOT_FOUND_TEXT.searchPlaceholder}"`);
    expect(input[0]).toContain(`aria-label="${NOT_FOUND_TEXT.searchLabel}"`);
    expect(html).toContain('mantine-TextInput-root" data-size="xl"');
    expect(html).toContain('data-with-left-section="true"');
  });

  it('di bawah kolom cari: satu tautan "Atau lihat Peta Informasi" ke /peta-informasi (pola apple "Or see our site map ›")', () => {
    expect(NOT_FOUND_TEXT.sitemapLabel).toBe('Atau lihat Peta Informasi');
    const anchors = html.match(/<a\b[^>]*>/g) ?? [];
    expect(anchors).toHaveLength(1);
    expect(anchors[0]).toContain('href="/peta-informasi"');
    expect(anchors[0]).not.toContain('target=');
    // Label dibungkus span sapuan warna (link-reveal .cta, wajib data-text) + chevron ikon tersembunyi.
    expect(html).toMatch(/<a\b[^>]*>\s*<span[^>]*data-text="Atau lihat Peta Informasi"[^>]*>Atau lihat Peta Informasi<\/span>\s*<svg[^>]*aria-hidden="true"/);
    // Urutan: judul → kolom cari → tautan.
    expect(html.indexOf('<input')).toBeLessThan(html.indexOf('href="/peta-informasi"'));
    expect(html).not.toContain('›');
  });

  it('tanpa angka 404 atau tombol', () => {
    expect(html).not.toMatch(/\b404\b/);
    expect(html).not.toMatch(/<button\b/);
  });
});

describe('GlobalSearch di navbar tidak berubah', () => {
  it('tanpa inputProps tetap placeholder "Cari apapun..." ukuran md', () => {
    const html = render(<GlobalSearch />);
    expect(html.match(/<input[^>]*>/)?.[0]).toContain('placeholder="Cari apapun..."');
    expect(html).toContain('mantine-TextInput-root" data-size="md"');
    expect(html).not.toContain('data-with-left-section');
  });
});

describe('src/app/not-found.tsx', () => {
  it('judul tab "Halaman tidak ditemukan" dan tidak diindeks mesin pencari', () => {
    expect(metadata.title).toBe('Halaman tidak ditemukan');
    expect(metadata.robots).toMatchObject({ index: false, googleBot: { index: false } });
  });

  it('isi 404 dibungkus kerangka publik (navbar & footer)', async () => {
    const html = render(await NotFound());
    expect(html).toMatch(/<div data-shell="publik">[\s\S]*<h1/);
  });

  it('override visibilitas menu dari DB diteruskan ke navbar/pencarian', async () => {
    db.overrides = { '/keamanan/cctv': false };
    let hidden: string[] = [];
    function Probe() {
      hidden = useMenuVisibility().hiddenHrefs;
      return null;
    }
    // Probe dirender di dalam provider milik not-found lewat shell tiruan.
    const el = await NotFound();
    const withProbe = { ...el, props: { ...el.props, children: <Probe /> } };
    render(withProbe);
    expect(hidden).toContain('/keamanan/cctv');
    db.overrides = {};
  });
});
