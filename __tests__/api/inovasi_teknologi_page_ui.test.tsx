// @vitest-environment node
// Halaman publik Inovasi Teknologi Desa: kartu menampilkan label kategori, pil kategori dari URL, teks kosong per
// kategori, dan detail dengan pil kategori yang menaut ke daftar tersaring.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
import { InovasiDetailBody } from '@/app/(public)/(pages)/inovasi/inovasi-teknologi-desa/_com/detail/InovasiDetail';
import { InovasiTeknologiBody } from '@/app/(public)/(pages)/inovasi/inovasi-teknologi-desa/_com/InovasiTeknologiPage';
import {
  inovasiListHref,
  inovasiTabs,
  parseInovasiParams,
  toInovasiItem,
  type InovasiParams,
} from '@/app/(public)/(pages)/inovasi/inovasi-teknologi-desa/_com/inovasi.logic';
import { INOVASI_TEXT } from '@/app/(public)/(pages)/inovasi/inovasi-teknologi-desa/_com/inovasi.text';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: entri rekaan.
const apiItem = (id: string, kategori: string) => ({
  id,
  name: `Inovasi ${id}`,
  deskripsi: '<p>Ringkasan <strong>inovasi</strong></p>',
  kategori,
  createdAt: '2026-11-10T03:00:00.000Z',
  image: { link: `/api/img/${id}.webp` },
});

const PARAMS: InovasiParams = { kategori: '', search: '', page: 1 };
const ready = (items: ReturnType<typeof apiItem>[]) => ({
  items: items.map(toInovasiItem),
  totalPages: 1,
  loading: false,
  refreshing: false,
  failed: false,
});
const body = (state: ReturnType<typeof ready>, params = PARAMS) =>
  render(<InovasiTeknologiBody state={state} params={params} onPage={() => {}} />);

describe('daftar publik (SSR)', () => {
  it('kartu merender label kategori kedua jenis inovasi + tautan detail', () => {
    const html = body(ready([apiItem('a1', 'digital'), apiItem('a2', 'tepat-guna'), apiItem('a3', 'digital')]));
    expect(html).toContain('Desa Digital / Smart Village');
    expect(html).toContain('Teknologi Tepat Guna');
    expect(html).toContain('href="/inovasi/inovasi-teknologi-desa/a2"');
    expect(html).toContain('Ringkasan inovasi');
  });

  it('kategori tak dikenal → kartu tanpa label (tidak menampilkan nilai mentah)', () => {
    const item = toInovasiItem(apiItem('x', 'lainnya'));
    expect(item.kategori).toBeUndefined();
  });

  it('kosong pada kategori aktif → pesan menyebut kategori', () => {
    const html = body(ready([]), { ...PARAMS, kategori: 'tepat-guna' });
    expect(html).toContain(INOVASI_TEXT.emptyKategori('Teknologi Tepat Guna'));
  });

  it('gagal muat → pesan galat', () => {
    const html = body({ items: [], totalPages: 1, loading: false, refreshing: false, failed: true });
    expect(html).toContain(INOVASI_TEXT.error);
  });

  it('ganti kategori/kata kunci/halaman sedang dimuat → kartu lama tetap tampil di wadah aria-busy, bukan kerangka', () => {
    const html = body({ ...ready([apiItem('a1', 'digital')]), refreshing: true }, { ...PARAMS, search: 'pupuk' });
    expect(html).toMatch(/<div class="[^"]+" aria-busy="true">/);
    expect(html).toContain('href="/inovasi/inovasi-teknologi-desa/a1"');
    expect(html).not.toContain(INOVASI_TEXT.emptySearch('pupuk'));
  });
});

describe('parameter URL & pil kategori', () => {
  it('parseInovasiParams: kategori sah dipakai, tak dikenal → semua', () => {
    expect(parseInovasiParams(new URLSearchParams('kategori=tepat-guna&search=+pupuk+&page=2'))).toEqual({
      kategori: 'tepat-guna',
      search: 'pupuk',
      page: 2,
    });
    expect(parseInovasiParams(new URLSearchParams('kategori=infotekno')).kategori).toBe('');
  });

  it('inovasiListHref tidak menulis nilai bawaan', () => {
    expect(inovasiListHref()).toBe('/inovasi/inovasi-teknologi-desa');
    expect(inovasiListHref({ kategori: 'digital', search: 'app', page: 3 })).toBe(
      '/inovasi/inovasi-teknologi-desa?kategori=digital&search=app&page=3',
    );
  });

  it('pil: Semua + dua kategori, aktif sesuai URL, kata kunci dibawa', () => {
    const tabs = inovasiTabs('digital', 'app');
    expect(tabs.map((t) => [t.label, t.active])).toEqual([
      ['Semua', false],
      ['Desa Digital / Smart Village', true],
      ['Teknologi Tepat Guna', false],
    ]);
    expect(tabs[2].href).toBe('/inovasi/inovasi-teknologi-desa?kategori=tepat-guna&search=app');
  });
});

describe('detail publik (SSR)', () => {
  it('pil kategori menaut ke daftar tersaring, judul & isi tampil', () => {
    const html = render(<InovasiDetailBody data={apiItem('d1', 'tepat-guna')} />);
    expect(html).toContain('href="/inovasi/inovasi-teknologi-desa?kategori=tepat-guna"');
    expect(html).toContain('Teknologi Tepat Guna');
    expect(html).toContain('Inovasi d1');
    expect(html).toContain('<strong>inovasi</strong>');
  });
});
