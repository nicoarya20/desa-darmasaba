// @vitest-environment node
// Info Teknologi Tepat Guna: ubin dibaca langsung (pola Tips Keamanan), foto rasio asli tanpa potong.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup, aturan foto dibaca dari CSS module.
import { MantineProvider } from '@mantine/core';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
import { InfoTtgBody } from '@/app/(public)/(pages)/inovasi/info-teknologi-tepat-guna/_com/InfoTtgPage';
import { TtgCard } from '@/app/(public)/(pages)/inovasi/info-teknologi-tepat-guna/_com/TtgCard';
import { toTtg } from '@/app/(public)/(pages)/inovasi/info-teknologi-tepat-guna/_com/info-ttg.logic';
import s from '@/app/(public)/(pages)/inovasi/info-teknologi-tepat-guna/_com/info-ttg.module.css';
import { INFO_TTG_TEXT as T } from '@/app/(public)/(pages)/inovasi/info-teknologi-tepat-guna/_com/info-ttg.text';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const identity = (html: string) => html;
// test-only
const ttg = (i: number, extra: Partial<{ deskripsi: string | null; image: { link: string } | null }> = {}) =>
  toTtg({ id: `t${i}`, name: `Teknologi ${i}`, deskripsi: `<p>Isi ${i}</p>`, image: null, ...extra }, identity);
const css = readFileSync(
  path.join(process.cwd(), 'src/app/(public)/(pages)/inovasi/info-teknologi-tepat-guna/_com/info-ttg.module.css'),
  'utf8',
);

describe('TtgCard', () => {
  it('dengan foto: foto alt="" di kolom kiri, judul + isi di kolom kanan', () => {
    const html = render(<TtgCard item={ttg(1, { image: { link: '/api/img/a.webp' } })} />);
    expect(html).toContain(`<figure class="${s.photo}">`);
    expect(html).toContain('src="/api/img/a.webp"');
    expect(html).toContain('alt=""');
    expect(html).toContain(`<div class="${s.body}"><h3 class="${s.title}">Teknologi 1</h3><div class="${s.content}"><p>Isi 1</p>`);
  });

  it('tanpa foto: tanpa placeholder, judul di kolom kiri', () => {
    const html = render(<TtgCard item={ttg(2)} />);
    expect(html).not.toContain('<img');
    expect(html).not.toContain('no-image');
    expect(html).toContain(`<div class="${s.aside}"><h3 class="${s.title}">Teknologi 2</h3></div>`);
  });

  it('tanpa foto & isi → ubin satu kolom', () => {
    const html = render(<TtgCard item={ttg(3, { deskripsi: '<p></p>' })} />);
    expect(html).toContain(`class="${s.item} ${s.itemSolo}"`);
    expect(html).not.toContain(s.body);
  });
});

describe('foto rasio asli (CSS)', () => {
  it('tidak dipotong: contain + tinggi auto, lebar maks 560px; bukan cover', () => {
    const rule = css.match(/\.photoImg \{[^}]*\}/)?.[0] ?? '';
    expect(rule).toContain('object-fit: contain');
    expect(rule).toContain('height: auto');
    expect(rule).toContain('max-width: 560px');
    expect(css).not.toContain('object-fit: cover');
  });
});

describe('InfoTtgBody', () => {
  const body = (state: Parameters<typeof InfoTtgBody>[0]['state'], search = '', page = 1) =>
    render(<InfoTtgBody state={state} search={search} page={page} onPage={() => {}} />);

  it('entri dibaca langsung (tanpa tautan detail); 1 halaman → tanpa paginasi', () => {
    const html = body({ status: 'ready', items: [ttg(1), ttg(2)], totalPages: 1, total: 2 });
    expect(html).toContain('>Teknologi 1</h3>');
    expect(html).toContain('>Teknologi 2</h3>');
    expect(html).not.toContain('<a ');
    expect(html).not.toContain(`aria-label="${T.paginationLabel}"`);
  });

  it('> 1 halaman → paginasi', () => {
    expect(body({ status: 'ready', items: [ttg(1)], totalPages: 2, total: 11 })).toContain(`aria-label="${T.paginationLabel}"`);
  });

  it('memuat → kerangka aria-busy; kosong / cari tanpa hasil / galat → kotak satu kalimat', () => {
    const loading = body({ status: 'loading' });
    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain(`aria-label="${T.loading}"`);
    expect(body({ status: 'ready', items: [], totalPages: 1, total: 0 })).toContain(`<p class="${kabar.empty}">${T.empty}</p>`);
    expect(body({ status: 'ready', items: [], totalPages: 1, total: 0 }, 'telur')).toContain(T.emptySearch('telur'));
    expect(body({ status: 'error' })).toContain(T.error);
  });

  it('?page di luar rentang padahal ada entri → kerangka selama dialihkan, bukan pesan kosong / paginasi', () => {
    const html = body({ status: 'ready', items: [], totalPages: 1, total: 3 }, '', 99);
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain(T.empty);
    expect(html).not.toContain(`aria-label="${T.paginationLabel}"`);
  });

  it('?page di luar rentang dan total = 0 → tetap pesan kosong', () => {
    expect(body({ status: 'ready', items: [], totalPages: 1, total: 0 }, '', 99)).toContain(T.empty);
  });
});
