// @vitest-environment node
// Program Kreatif Desa publik: ubin tanpa foto (ikon garis, seluruh ubin tautan), keadaan muat/kosong/galat, detail.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
import { ProgramKreatifDetailBody } from '@/app/(public)/(pages)/inovasi/program-kreatif-desa/_com/detail/ProgramKreatifDetail';
import ds from '@/app/(public)/(pages)/inovasi/program-kreatif-desa/_com/detail/program-kreatif-detail.module.css';
import { ProgramKreatifBody } from '@/app/(public)/(pages)/inovasi/program-kreatif-desa/_com/ProgramKreatifPage';
import { toProgramKreatifItem } from '@/app/(public)/(pages)/inovasi/program-kreatif-desa/_com/program-kreatif.logic';
import s from '@/app/(public)/_com/program-tiles/program-tiles.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: bentuk entri stg 2026-11-16 (dipangkas).
const api = (i: number, icon = 'ekonomi') => ({
  id: `pk${i}`,
  name: `Program ${i}`,
  slug: `Ringkasan program ${i}`,
  deskripsi: `<p>Isi program ${i}</p>`,
  icon,
  createdAt: '2026-01-20T03:00:00.000Z',
});
const ready = (list: ReturnType<typeof api>[]) => ({ status: 'ready' as const, items: list.map(toProgramKreatifItem) });
const body = (state: Parameters<typeof ProgramKreatifBody>[0]['state'], search = '', page = 1) =>
  render(<ProgramKreatifBody state={state} search={search} page={page} onPage={() => {}} />);

describe('ProgramKreatifBody', () => {
  it('ubin = tautan detail: ikon garis, judul h3, deskripsi singkat, "Selengkapnya"', () => {
    const html = body(ready([api(1), api(2)]));
    expect(html).toContain(`<a href="/inovasi/program-kreatif-desa/pk1" class="${s.tile} ${r.trigger}">`);
    expect(html).toContain(`<span class="${s.icon}" aria-hidden="true"><svg`);
    expect(html).toContain(`<h3 class="${s.title}"><span class="${r.title}">Program 1</span></h3>`);
    expect(html).toContain(`<span class="${s.summary}">Ringkasan program 1</span>`);
    expect(html).toContain(`<span class="${r.cta}" data-text="Selengkapnya">Selengkapnya</span>`);
    expect(html).not.toContain('<img');
  });

  it('ikon kosong → tanpa ikon (tanpa teks "Tidak ada ikon")', () => {
    const html = body(ready([api(1, '')]));
    expect(html).not.toContain(s.icon);
    expect(html).not.toContain('Tidak ada ikon');
  });

  it('paginasi klien 9 per halaman; 1 halaman → paginasi tidak dirender', () => {
    const list = Array.from({ length: 10 }, (_, i) => api(i + 1));
    expect(body(ready(list))).toContain('aria-label="Halaman daftar program kreatif"');
    const page2 = body(ready(list), '', 2);
    expect(page2).toContain(`<h3 class="${s.title}"><span class="${r.title}">Program 10</span></h3>`);
    expect(page2).not.toContain(`<h3 class="${s.title}"><span class="${r.title}">Program 9</span></h3>`);
    expect(body(ready([api(1)]))).not.toContain('Halaman daftar program kreatif');
  });

  it('memuat: kerangka berdenyut aria-busy', () => {
    const html = body({ status: 'loading' });
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain(kabar.placeholder);
  });

  it('kosong / cari tanpa hasil / galat → kotak pesan', () => {
    expect(body(ready([]))).toContain(`<p class="${kabar.empty}">Belum ada program kreatif.</p>`);
    expect(body(ready([]), 'zzz')).toContain('Tidak ada program kreatif yang cocok dengan “zzz”.');
    expect(body({ status: 'error' })).toContain('Program kreatif gagal dimuat. Coba muat ulang halaman.');
  });
});

describe('ProgramKreatifDetailBody', () => {
  it('kategori, judul h1, deskripsi singkat sebagai pengantar, isi; tanpa label gaya form admin', () => {
    const html = render(<ProgramKreatifDetailBody data={api(1)} />);
    expect(html).toContain(`<span class="${d.kategori}">Program Kreatif Desa</span>`);
    expect(html).toContain(`<h1 class="${d.title}">Program 1</h1>`);
    expect(html).toContain(`<p class="${ds.lead}">Ringkasan program 1</p>`);
    expect(html).toContain(`<div class="${d.content}"><p>Isi program 1</p></div>`);
    for (const label of ['Deskripsi Singkat', '>Deskripsi<']) expect(html).not.toContain(label);
  });

  it('deskripsi singkat & isi kosong → tidak dirender', () => {
    const html = render(<ProgramKreatifDetailBody data={{ ...api(1), slug: ' ', deskripsi: '' }} />);
    expect(html).not.toContain(ds.lead);
    expect(html).not.toContain(d.content);
  });
});
