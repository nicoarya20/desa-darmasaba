// @vitest-environment node
// Gotong Royong publik: kartu gaya Kegiatan Desa (grid), keadaan muat/kosong/galat, cari & paginasi klien.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
import { GotongRoyongBody } from '@/app/(public)/(pages)/lingkungan/gotong-royong/_com/GotongRoyongPage';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import type { KabarItem } from '@/app/(public)/_com/main-page/kabar-desa/kabar.logic';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: kartu Gotong Royong siap tampil.
const item = (i: number): KabarItem => ({
  id: `g${i}`,
  title: i === 1 ? 'Mareresik Pura Desa' : `Gotong royong ${i}`,
  summary: 'Bersama warga',
  kategori: 'Lingkungan',
  createdAt: Date.UTC(2024, 0, 28 - i),
  href: `/lingkungan/gotong-royong/lingkungan/g${i}`,
});
type State = LoadState<KabarItem[]>;
const ready = (n: number): State => ({ status: 'ready', data: Array.from({ length: n }, (_, i) => item(i + 1)) });
const body = (state: State, search = '', page = 1) =>
  render(<GotongRoyongBody state={state} search={search} page={page} onPage={() => {}} />);

describe('GotongRoyongBody', () => {
  it('memuat: kerangka berdenyut aria-busy berlabel', () => {
    const html = body({ status: 'loading' });
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('aria-label="Memuat kegiatan gotong royong"');
    expect(html).toContain(kabar.placeholder);
  });

  it('siap (3 kegiatan stg): kartu utama + 2 kartu grid ke detail Gotong Royong, tanpa paginasi', () => {
    const html = body(ready(3));
    expect(html).toContain(`class="${kabar.rail} ${kabar.railGrid}"`);
    expect(html).toContain('href="/lingkungan/gotong-royong/lingkungan/g1"');
    expect(html).toContain('href="/lingkungan/gotong-royong/lingkungan/g3"');
    expect(html).not.toContain('/pemerintahan/kegiatan-desa');
    expect(html).not.toContain('aria-label="Halaman daftar gotong royong"');
  });

  it('lebih dari 7 kegiatan: 7 per halaman + paginasi; halaman 2 berisi sisanya', () => {
    expect(body(ready(9))).toContain('aria-label="Halaman daftar gotong royong"');
    const page2 = body(ready(9), '', 2);
    expect(page2).toContain('href="/lingkungan/gotong-royong/lingkungan/g8"');
    expect(page2).not.toContain('href="/lingkungan/gotong-royong/lingkungan/g7"');
  });

  it('cari klien menyaring kartu; tidak cocok → kotak kosong dengan kata kunci', () => {
    const found = body(ready(3), 'mareresik');
    expect(found).toContain('Mareresik Pura Desa');
    expect(found).not.toContain('Gotong royong 2');
    expect(body(ready(3), 'olahraga')).toContain(`<p class="${kabar.empty}">Tidak ada kegiatan gotong royong yang cocok dengan “olahraga”.</p>`);
  });

  it('kosong & galat → satu kalimat di kotak kosong, tanpa kartu', () => {
    expect(body(ready(0))).toContain(`<p class="${kabar.empty}">Belum ada kegiatan gotong royong.</p>`);
    const error = body({ status: 'error' });
    expect(error).toContain('Kegiatan gotong royong gagal dimuat. Coba muat ulang halaman.');
    expect(error).not.toContain(kabar.featured);
  });
});
