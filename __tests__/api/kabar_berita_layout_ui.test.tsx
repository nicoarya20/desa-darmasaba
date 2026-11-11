// @vitest-environment node
// KabarBerita dipakai beranda (layout "rail") dan halaman daftar berita (layout "grid").
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import type { AnchorHTMLAttributes } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
import { KabarBerita } from '@/app/darmasaba/_com/main-page/kabar-desa/KabarBerita';
import type { KabarItem } from '@/app/darmasaba/_com/main-page/kabar-desa/kabar.logic';
import s from '@/app/darmasaba/_com/main-page/kabar-desa/kabar.module.css';

// test-only: entri berita siap tampil.
const item = (id: string): KabarItem => ({
  id,
  title: `Berita ${id}`,
  summary: 'Ringkasan',
  kategori: 'Budaya',
  createdAt: Date.UTC(2026, 10, 3, 2),
  href: `/darmasaba/pemerintahan/berita/Budaya/${id}`,
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
