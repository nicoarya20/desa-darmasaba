// @vitest-environment node
// KabarBerita dipakai beranda (layout "rail") dan halaman daftar berita (layout "grid").
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import type { AnchorHTMLAttributes } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
import { KabarBerita } from '@/app/(public)/_com/main-page/kabar-desa/KabarBerita';
import type { KabarItem } from '@/app/(public)/_com/main-page/kabar-desa/kabar.logic';
import s from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';

// test-only: entri berita siap tampil.
const item = (id: string): KabarItem => ({
  id,
  title: `Berita ${id}`,
  summary: 'Ringkasan',
  kategori: 'Budaya',
  createdAt: Date.UTC(2026, 10, 3, 2),
  href: `/pemerintahan/berita/Budaya/${id}`,
});

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const count = (html: string, needle: string) => html.split(needle).length - 1;

describe('KabarBerita layout', () => {
  it('rail (bawaan beranda): tanpa kelas grid', () => {
    const html = render(<KabarBerita items={[item('a'), item('b')]} loading={false} />);
    expect(html).toContain(`class="${s.rail}"`);
    expect(html).not.toContain(s.railGrid);
  });

  it('grid: daftar kartu kecil memakai kelas grid, kartu pertama jadi berita utama', () => {
    const items = ['a', 'b', 'c', 'd'].map(item);
    const html = render(<KabarBerita items={items} loading={false} layout="grid" />);
    expect(html).toContain(`class="${s.rail} ${s.railGrid}"`);
    expect(html).toContain(`class="${s.featuredTitle}">Berita a</h3>`);
    expect(count(html, `class="${s.cardTitle}"`)).toBe(3);
  });

  it('memuat: jumlah kerangka kartu kecil mengikuti placeholderCards', () => {
    const html = render(<KabarBerita items={[]} loading layout="grid" placeholderCards={6} />);
    expect(html).toContain('aria-busy="true"');
    expect(count(html, `${s.card} ${s.placeholder}`)).toBe(6);
  });
});

describe('KabarBerita label pembaca layar', () => {
  it('bawaan (beranda & Berita): "Berita terbaru" dan "Memuat kabar desa"', () => {
    expect(render(<KabarBerita items={[item('a'), item('b')]} loading={false} />)).toContain('aria-label="Berita terbaru"');
    expect(render(<KabarBerita items={[]} loading />)).toContain('aria-label="Memuat kabar desa"');
  });

  it('kustom (Kegiatan Desa): label daftar dan label memuat dipakai', () => {
    const list = render(<KabarBerita items={[item('a'), item('b')]} loading={false} listLabel="Kegiatan lainnya" />);
    expect(list).toContain('aria-label="Kegiatan lainnya"');
    expect(list).not.toContain('Berita terbaru');
    const busy = render(<KabarBerita items={[]} loading loadingLabel="Memuat kegiatan desa" />);
    expect(busy).toContain('aria-label="Memuat kegiatan desa"');
  });
});
