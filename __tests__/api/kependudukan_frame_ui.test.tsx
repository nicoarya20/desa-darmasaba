// @vitest-environment node
// Kerangka Dashboard Kependudukan: kartu hero, rel pil, dan ubin terkait (markup tiap keadaan).
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup (efek klien tidak berjalan).
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { toDatasetSlice } from '@/app/(public)/(pages)/kependudukan/_com/data/kependudukan-data.logic';
import type { DatasetSlice } from '@/app/(public)/(pages)/kependudukan/_com/data/kependudukan-data.types';
import { KependudukanHero } from '@/app/(public)/(pages)/kependudukan/_com/frame/KependudukanHero';
import { KependudukanTerkait } from '@/app/(public)/(pages)/kependudukan/_com/frame/KependudukanTerkait';
import { SectionNav } from '@/app/(public)/(pages)/kependudukan/_com/frame/SectionNav';
import { NAV_SECTIONS } from '@/app/(public)/(pages)/kependudukan/_com/frame/section-nav.logic';

vi.mock('next-view-transitions', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const noop = () => {};
// test-only: 2 banjar + dinamika satu tahun.
const BANJAR = [
  { id: 'a', nama: 'Taman', penduduk: 1082, kk: 225, miskin: 0, tahun: 2026 },
  { id: 'b', nama: 'Menesa', penduduk: 403, kk: 103, miskin: 0, tahun: 2026 },
];
const DINAMIKA = [{ id: 'd', tahun: 2025, kelahiran: 52, kematian: 21, masuk: 18, keluar: 12 }];
const ready = (rows: unknown[]): DatasetSlice => toDatasetSlice({ status: 'ready', rows }, noop);
const NOW = new Date('2026-11-17T03:00:00Z');
const hero = (banjar: DatasetSlice, dinamika: DatasetSlice) => render(<KependudukanHero banjar={banjar} dinamika={dinamika} now={NOW} />);

describe('KependudukanHero', () => {
  it('section #ringkasan berjudul (sr-only) dengan 4 kartu bertahun', () => {
    const html = hero(ready(BANJAR), ready(DINAMIKA));
    expect(html).toMatch(/<section id="ringkasan" aria-labelledby="kependudukan-ringkasan-title"/);
    expect(html).toMatch(/<h2 id="kependudukan-ringkasan-title"[^>]*>Ringkasan<\/h2>/);
    const out = text(html);
    expect(out).toContain('Total penduduk 1.485 jiwa 2 banjar · Data 2026');
    expect(out).toContain('Kepala keluarga 328 KK Data 2026');
    expect(out).toContain('Rata-rata per keluarga 4,5 jiwa');
    expect(out).toContain('Pertumbuhan bersih +37 jiwa');
    expect(out).toContain('· 2025');
    expect(html).not.toContain('aria-busy');
  });

  it('memuat → kerangka + aria-busy, tanpa angka', () => {
    const loading = toDatasetSlice({ status: 'loading' }, noop);
    const html = hero(loading, loading);
    expect(html).toContain('aria-busy="true"');
    expect(html.match(/data-status="loading"/g)).toHaveLength(4);
    expect(text(html)).not.toMatch(/\d/);
  });

  it('kosong → "Belum diisi", galat → "Gagal dimuat"; tidak pernah angka 0 pengganti', () => {
    const out = text(hero(ready([]), toDatasetSlice({ status: 'error' }, noop)));
    expect(out.match(/Belum diisi/g)).toHaveLength(3);
    expect(out.match(/Gagal dimuat/g)).toHaveLength(1);
    expect(out).not.toMatch(/\b0\b/);
  });
});

describe('SectionNav', () => {
  it('pil = tautan anchor; pil pertama aktif saat render awal', () => {
    const html = render(<SectionNav sections={NAV_SECTIONS} />);
    expect(html).toContain('aria-label="Bagian Dashboard Kependudukan"');
    const hrefs = [...html.matchAll(/href="(#[a-z]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(['#ringkasan', '#banjar', '#umur', '#agama', '#dinamika']);
    expect(html.match(/aria-current="location"/g)).toHaveLength(1);
    expect(html).toMatch(/href="#ringkasan"[^>]*aria-current="location"/);
  });
});

describe('KependudukanTerkait', () => {
  it('tiga ubin ke data penduduk menu lain, label aside berbeda-beda', () => {
    const html = render(<KependudukanTerkait hiddenHrefs={[]} />);
    expect([...html.matchAll(/<a href="([^"]+)"/g)].map((m) => m[1])).toEqual([
      '/ekonomi/jumlah-penduduk-miskin',
      '/ekonomi/demografi-pekerjaan',
      '/pendidikan/data-pendidikan',
    ]);
    const labels = [...html.matchAll(/<aside aria-label="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(labels).size).toBe(3);
  });

  it('submenu tersembunyi tidak ditautkan; semua tersembunyi → tidak dirender', () => {
    const one = render(<KependudukanTerkait hiddenHrefs={['/ekonomi/demografi-pekerjaan']} />);
    expect(one).not.toContain('/ekonomi/demografi-pekerjaan');
    expect(one).toContain('/pendidikan/data-pendidikan');
    const none = render(
      <KependudukanTerkait hiddenHrefs={['/ekonomi/jumlah-penduduk-miskin', '/ekonomi/demografi-pekerjaan', '/pendidikan/data-pendidikan']} />,
    );
    expect(none).not.toContain('<aside');
  });
});
