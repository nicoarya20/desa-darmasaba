// @vitest-environment node
// Pencegahan Kriminalitas publik: sorotan video (fasad, tanpa iframe sebelum diklik), kartu gaya Kabar, detail 860px.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
import { PencegahanDetailBody } from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/detail/PencegahanDetail';
import { PencegahanBody } from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/PencegahanPage';
import { toPencegahanItem } from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/pencegahan.logic';
import s from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/pencegahan.module.css';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: bentuk entri stg 2026-11-12 (dipangkas).
const api = (i: number, linkVideo = `https://www.youtube.com/embed/RJOv2S0LhJ${i % 10}`) => ({
  id: `pk${i}`,
  judul: `Program ${i}`,
  deskripsiSingkat: `<p>Ringkasan &amp; program ${i}</p>`,
  deskripsi: `<ul><li><p>Langkah ${i}</p></li></ul>`,
  linkVideo,
  createdAt: `2026-07-${String(28 - i).padStart(2, '0')}T07:54:34.161Z`,
});
const ready = (list: ReturnType<typeof api>[]) => ({ status: 'ready' as const, items: list.map(toPencegahanItem) });
const body = (state: Parameters<typeof PencegahanBody>[0]['state'], search = '', page = 1) =>
  render(<PencegahanBody state={state} search={search} page={page} onPage={() => {}} />);

describe('PencegahanBody', () => {
  it('sorotan = entri pertama dengan fasad video (pratinjau + tombol putar), tanpa iframe', () => {
    const html = body(ready([api(1), api(2), api(3)]));
    expect(html).toContain(`<article class="${s.sorotan}"`);
    expect(html).toContain('aria-label="Putar video: Program 1"');
    expect(html).toContain('https://i.ytimg.com/vi/RJOv2S0LhJ1/hqdefault.jpg');
    expect(html).not.toContain('<iframe');
    expect(html).toContain('>Sorotan</span>');
    expect(html).toContain('<a href="/keamanan/pencegahan-kriminalitas/pk1">Program 1</a>');
    expect(html).toContain('Ringkasan &amp; program 1');
  });

  it('sorotan tidak muncul lagi sebagai kartu; kartu memakai kelas Kabar', () => {
    const html = body(ready([api(1), api(2), api(3)]));
    expect(html).not.toContain(`<h3 class="${kabar.cardTitle}">Program 1`);
    expect(html).toContain(`<h3 class="${kabar.cardTitle}">Program 2`);
    expect(html).toContain(`<h3 class="${kabar.cardTitle}">Program 3`);
    expect(html).toContain('>Program lainnya</h2>');
    expect(html).toContain(`class="${kabar.rail} ${kabar.railGrid}"`);
  });

  it('item tanpa video YouTube valid: sorotan panel teks tanpa pratinjau, kartu pakai ikon pengganti', () => {
    const html = body(ready([api(1, 'bukan url'), api(2, 'https://vimeo.com/1')]));
    expect(html).toContain(`<article class="${s.sorotan} ${s.sorotanPlain}"`);
    expect(html).not.toContain('Putar video');
    expect(html).not.toContain('i.ytimg.com');
    expect(html).toContain(kabar.photoFallback);
    expect(html).not.toContain('berisi video');
  });

  it('cari / halaman 2: tanpa sorotan', () => {
    const searched = body(ready([api(1), api(2)]), 'maling');
    expect(searched).not.toContain(s.sorotan);
    expect(searched).toContain('>Hasil pencarian</h2>');
    expect(searched).toContain(`<h3 class="${kabar.cardTitle}">Program 1`);

    const list = Array.from({ length: 9 }, (_, i) => api(i + 1));
    const page2 = body(ready(list), '', 2);
    expect(page2).not.toContain(s.sorotan);
    expect(page2).toContain(`<h3 class="${kabar.cardTitle}">Program 8`);
    expect(page2).toContain(`<h3 class="${kabar.cardTitle}">Program 9`);
    expect(page2).not.toContain(`<h3 class="${kabar.cardTitle}">Program 7`);
    expect(page2).toContain('aria-label="Halaman daftar program pencegahan kriminalitas"');
  });

  it('1 halaman: paginasi tidak dirender', () => {
    expect(body(ready([api(1), api(2), api(3), api(4)]))).not.toContain('Halaman daftar program');
  });

  it('kosong / cari tanpa hasil / galat → kotak pesan', () => {
    expect(body(ready([]))).toContain(`<p class="${kabar.empty}">Belum ada program pencegahan kriminalitas.</p>`);
    expect(body(ready([]), 'zzz')).toContain('Tidak ada program yang cocok dengan “zzz”.');
    expect(body({ status: 'error' })).toContain('Program pencegahan kriminalitas gagal dimuat. Coba muat ulang halaman.');
  });

  it('memuat: kerangka sorotan hanya di halaman 1 tanpa cari', () => {
    expect(body({ status: 'loading' })).toContain(`${kabar.featured} ${kabar.placeholder}`);
    expect(body({ status: 'loading' }, 'x')).not.toContain(kabar.featured);
    expect(body({ status: 'loading' })).toContain('aria-busy="true"');
  });

  it('tanpa gaya lama (tombol biru penuh judul, "Jelajahi Program Lainnya")', () => {
    const html = body(ready([api(1), api(2)]));
    expect(html).not.toContain('Jelajahi Program Lainnya');
    expect(html).not.toContain('Program Keamanan Berjalan');
  });
});

describe('PencegahanDetailBody', () => {
  it('kategori · tanggal, judul h1, ringkasan, fasad video, isi; tanpa label bergaya form admin', () => {
    const html = render(<PencegahanDetailBody data={api(1)} />);
    expect(html).toContain(`<a href="/keamanan/pencegahan-kriminalitas" class="${d.kategori}">Pencegahan Kriminalitas</a>`);
    expect(html).toContain(`<h1 class="${d.title}">Program 1</h1>`);
    expect(html).toContain('Ringkasan &amp; program 1');
    expect(html).toContain('aria-label="Putar video: Program 1"');
    expect(html).not.toContain('<iframe');
    expect(html).toContain(`<div class="${d.content}"><ul><li><p>Langkah 1</p></li></ul></div>`);
    for (const label of ['Deskripsi Singkat', 'Deskripsi Lengkap', '>Judul<', '>Video<']) expect(html).not.toContain(label);
  });

  it('video non-YouTube → tautan tab baru; tidak valid → tidak ada video sama sekali', () => {
    const vimeo = render(<PencegahanDetailBody data={api(1, 'https://vimeo.com/123')} />);
    expect(vimeo).toContain('href="https://vimeo.com/123" target="_blank" rel="noopener noreferrer"');
    expect(vimeo).not.toContain('Putar video');
    const none = render(<PencegahanDetailBody data={{ ...api(1, 'x'), deskripsiSingkat: '', deskripsi: '' }} />);
    expect(none).not.toContain('Putar video');
    expect(none).not.toContain('Buka video');
    expect(none).not.toContain(d.content);
  });
});
