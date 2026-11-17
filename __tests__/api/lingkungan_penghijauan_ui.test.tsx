// @vitest-environment node
// Program Penghijauan publik: ubin tanpa foto (seluruh ubin tautan), keadaan muat/kosong/galat, paginasi klien, detail.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
import { PenghijauanDetailBody } from '@/app/(public)/(pages)/lingkungan/program-penghijauan/_com/detail/PenghijauanDetail';
import ds from '@/app/(public)/(pages)/lingkungan/program-penghijauan/_com/detail/penghijauan-detail.module.css';
import { PenghijauanBody } from '@/app/(public)/(pages)/lingkungan/program-penghijauan/_com/PenghijauanPage';
import {
  toPenghijauan,
  toPenghijauanDetail,
  type Penghijauan,
} from '@/app/(public)/(pages)/lingkungan/program-penghijauan/_com/penghijauan.logic';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import s from '@/app/(public)/_com/program-tiles/program-tiles.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: bentuk entri stg 2026-11-16 (dipangkas).
const api = (i: number, icon: string | null = 'pohon') => ({
  id: `ph${i}`,
  name: `Program ${i}`,
  judul: `Judul program ${i}`,
  deskripsi: `<p>Isi program ${i}</p>`,
  icon,
});
const ready = (list: ReturnType<typeof api>[]): LoadState<Penghijauan[]> => ({ status: 'ready', data: list.map(toPenghijauan) });
const body = (state: LoadState<Penghijauan[]>, search = '', page = 1) =>
  render(<PenghijauanBody state={state} search={search} page={page} onPage={() => {}} />);

describe('PenghijauanBody', () => {
  it('ubin = tautan detail: ikon garis, nama h3, judul abu, "Selengkapnya"; judul bagian hanya untuk pembaca layar', () => {
    const html = body(ready([api(1), api(2)]));
    expect(html).toContain(`<a href="/lingkungan/program-penghijauan/ph1" class="${s.tile} ${r.trigger}">`);
    expect(html).toContain(`<span class="${s.icon}" aria-hidden="true"><svg`);
    expect(html).toContain(`<h3 class="${s.title}"><span class="${r.title}">Program 1</span></h3>`);
    expect(html).toContain(`<span class="${s.summary}">Judul program 1</span>`);
    expect(html).toContain(`<span class="${r.cta}" data-text="Selengkapnya">Selengkapnya</span>`);
    expect(html).toContain('aria-label="Daftar program penghijauan"');
    expect(html).not.toContain('Manfaat Program');
    expect(html).not.toContain('<img');
  });

  it('ikon tak dikenal ("icon-test") → ubin tanpa ikon (bukan tanda tanya)', () => {
    const html = body(ready([api(1, 'icon-test')]));
    expect(html).not.toContain(s.icon);
    expect(html).toContain(`<h3 class="${s.title}"><span class="${r.title}">Program 1</span></h3>`);
  });

  it('cari di klien (?search=) menyaring ubin', () => {
    const html = body(ready([api(1), api(2)]), 'program 2');
    expect(html).toContain('Program 2');
    expect(html).not.toContain('Program 1<');
  });

  it('paginasi klien 9 per halaman; 1 halaman → paginasi tidak dirender', () => {
    const list = Array.from({ length: 10 }, (_, i) => api(i + 1));
    expect(body(ready(list))).toContain('aria-label="Halaman daftar program penghijauan"');
    const page2 = body(ready(list), '', 2);
    expect(page2).toContain(`<h3 class="${s.title}"><span class="${r.title}">Program 10</span></h3>`);
    expect(page2).not.toContain(`<h3 class="${s.title}"><span class="${r.title}">Program 9</span></h3>`);
    expect(body(ready([api(1)]))).not.toContain('Halaman daftar program penghijauan');
  });

  it('memuat: kerangka berdenyut aria-busy', () => {
    const html = body({ status: 'loading' });
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('aria-label="Memuat program penghijauan"');
    expect(html).toContain(kabar.placeholder);
  });

  it('kosong / cari tanpa hasil / galat → kotak pesan', () => {
    expect(body(ready([]))).toContain(`<p class="${kabar.empty}">Belum ada program penghijauan.</p>`);
    expect(body(ready([api(1)]), 'zzz')).toContain('Tidak ada program penghijauan yang cocok dengan “zzz”.');
    expect(body({ status: 'error' })).toContain('Program penghijauan gagal dimuat. Coba muat ulang halaman.');
  });
});

describe('PenghijauanDetailBody', () => {
  const identity = (html: string) => html;

  it('kategori, nama h1, judul admin sebagai pengantar, isi; tanpa label gaya form admin / teks cadangan', () => {
    const html = render(<PenghijauanDetailBody detail={toPenghijauanDetail(api(1), identity)} />);
    expect(html).toContain(`<span class="${d.kategori}">Program Penghijauan</span>`);
    expect(html).toContain(`<h1 class="${d.title}">Program 1</h1>`);
    expect(html).toContain(`<p class="${ds.lead}">Judul program 1</p>`);
    expect(html).toContain(`<div class="${d.content}"><p>Isi program 1</p></div>`);
    for (const text of ['tidak tersedia', 'belum tersedia', 'Kembali ke daftar']) expect(html).not.toContain(text);
  });

  it('judul & isi kosong → tidak dirender', () => {
    const html = render(<PenghijauanDetailBody detail={toPenghijauanDetail({ ...api(1), judul: '', deskripsi: '' }, identity)} />);
    expect(html).not.toContain(ds.lead);
    expect(html).not.toContain(d.content);
  });
});
