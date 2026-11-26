// @vitest-environment node
// Program Inovasi publik: ubin logo (seluruh ubin tautan detail), keadaan muat/kosong/galat, urutan dari API
// dipertahankan, dan isi halaman detail (logo, judul h1, isi editor dengan judul bagian, galeri). jsdom rusak di
// repo ini, jadi renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
import { ProgramInovasiBody } from '@/app/(public)/(pages)/inovasi/program-inovasi/_com/ProgramInovasiPage';
import { ProgramInovasiDetail } from '@/app/(public)/(pages)/inovasi/program-inovasi/_com/detail/ProgramInovasiDetail';
import ds from '@/app/(public)/(pages)/inovasi/program-inovasi/_com/detail/program-inovasi-detail.module.css';
import { toProgramInovasiTile } from '@/app/(public)/(pages)/inovasi/program-inovasi/_com/program-inovasi.logic';
import { PROGRAM_INOVASI_DETAIL_TEXT as DT, PROGRAM_INOVASI_TEXT as T } from '@/app/(public)/(pages)/inovasi/program-inovasi/_com/program-inovasi.text';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import s from '@/app/(public)/_com/program-tiles/program-tiles.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: item findMany fiktif, urutan sesuai balasan API (Davest urutan 1 di depan).
const api = (id: string, name: string, logo: string | null = `/api/img/${id}`) => ({
  id, name, description: `<p>Tentang ${name}</p>`, image: logo ? { link: logo } : null,
});
const ready = (list: ReturnType<typeof api>[]) => ({ status: 'ready' as const, items: list.map(toProgramInovasiTile), refreshing: false });
const body = (state: Parameters<typeof ProgramInovasiBody>[0]['state'], search = '', page = 1) =>
  render(<ProgramInovasiBody state={state} search={search} page={page} onPage={() => {}} />);

describe('ProgramInovasiBody', () => {
  it('ubin = tautan detail varian ber-logo dengan kotak logo, judul h3, ringkasan, "Selengkapnya"', () => {
    const html = body(ready([api('davest', 'Davest')]));
    expect(html).toContain(`<a href="/inovasi/program-inovasi/davest" class="${s.tile} ${s.tileLogo} ${r.trigger}">`);
    expect(html).toContain(`<span class="${s.logo}">`);
    expect(html).toContain('src="/api/img/davest"');
    expect(html).toMatch(/<h3[^>]*><span[^>]*>Davest<\/span><\/h3>/);
    expect(html).toContain('Tentang Davest');
    expect(html).toContain(T.selengkapnya);
  });

  it('urutan balasan API dipertahankan (Davest di depan Bares)', () => {
    const html = body(ready([api('davest', 'Davest'), api('bares', 'Bares')]));
    expect(html.indexOf('>Davest<')).toBeLessThan(html.indexOf('>Bares<'));
  });

  it('tanpa logo → pelat berisi inisial (aria-hidden, tanpa img), ubin tetap varian ber-logo', () => {
    const html = body(ready([api('gm', 'GM', null), api('bd', 'Bicara Darmasaba', null)]));
    expect(html).toContain(`class="${s.tile} ${s.tileLogo} ${r.trigger}"`);
    expect(html).toContain(`<span class="${s.logo}"><span class="${s.initials}" aria-hidden="true">GM</span></span>`);
    expect(html).toContain(`<span class="${s.initials}" aria-hidden="true">BD</span>`);
    expect(html).not.toContain('<img');
  });

  it('memuat → ubin kerangka; kosong, cari kosong, dan galat → pesan', () => {
    expect(body({ status: 'loading' })).toContain(`aria-label="${T.loading}"`);
    expect(body(ready([]))).toContain(T.empty);
    expect(body(ready([]), 'zzz')).toContain('Tidak ada program inovasi yang cocok dengan “zzz”.');
    expect(body({ status: 'error' })).toContain(T.error);
  });

  it('lebih dari 9 program → dipaginasi, halaman 2 berisi sisanya', () => {
    const list = Array.from({ length: 11 }, (_, i) => api(`p${i}`, `Program ${i}`));
    const html = body(ready(list), '', 2);
    expect(html).toContain('>Program 9<');
    expect(html).not.toContain('>Program 0<');
  });
});

describe('ProgramInovasiDetail', () => {
  const data = {
    name: 'Davest',
    logo: '/api/img/logo',
    html: '<p>Festival desa.</p><hr /><h3>Tujuan</h3><ul><li><p>Pelestarian budaya</p></li></ul>',
    photos: [{ id: 'a', link: '/api/img/a' }],
  };

  it('kembali ke daftar, logo ber-alt, kategori, judul h1, isi dengan judul bagian, galeri dokumentasi', () => {
    const html = render(<ProgramInovasiDetail data={data} />);
    expect(html).toMatch(new RegExp(`<a href="/inovasi/program-inovasi" class="[^"]*${r.trigger}"[^>]*>.*data-text="${DT.kembali}"`));
    expect(html).toContain(`<span class="${ds.logo}">`);
    expect(html).toContain(`alt="${DT.logoAlt('Davest')}"`);
    expect(html).toContain(DT.kategori);
    expect(html).toMatch(/<h1[^>]*>Davest<\/h1>/);
    expect(html).toContain('<h3>Tujuan</h3>');
    expect(html).toContain(DT.galleryTitle);
    expect(html).toContain('src="/api/img/a"');
  });

  it('tanpa logo, isi kosong, tanpa foto → tanpa kotak logo, pesan "Belum ada deskripsi", tanpa galeri', () => {
    const html = render(<ProgramInovasiDetail data={{ ...data, logo: null, html: '', photos: [] }} />);
    expect(html).not.toContain(`class="${ds.logo}"`);
    expect(html).toContain(DT.emptyDescription);
    expect(html).not.toContain(DT.galleryTitle);
  });
});
