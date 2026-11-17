// @vitest-environment node
// Data Lingkungan Desa publik: baris bergaris (ikon, nama h3, jumlah apa adanya, deskripsi), keadaan muat/kosong/galat, paginasi klien.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DataLingkunganRows } from '@/app/(public)/(pages)/lingkungan/data-lingkungan-desa/_com/DataLingkunganRows';
import {
  toDataLingkungan,
  type DataLingkungan,
} from '@/app/(public)/(pages)/lingkungan/data-lingkungan-desa/_com/data-lingkungan.logic';
import s from '@/app/(public)/(pages)/lingkungan/data-lingkungan-desa/_com/data-lingkungan.module.css';
import type { LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: bentuk entri stg 2026-11-16 (dipangkas); sanitize diganti identitas karena DOMPurify butuh DOM.
const entri = (i: number, icon: string | null = 'lingkunganSehat', jumlah = '1 paket kegiatan'): DataLingkungan =>
  toDataLingkungan({ id: `dl${i}`, name: `Data ${i}`, jumlah, deskripsi: `<p>Deskripsi data ${i}</p>`, icon }, (html) => html);
const ready = (items: DataLingkungan[]): LoadState<DataLingkungan[]> => ({ status: 'ready', data: items });
const rows = (state: LoadState<DataLingkungan[]>, search = '', page = 1) =>
  render(<DataLingkunganRows state={state} search={search} page={page} onPage={() => {}} />);

describe('DataLingkunganRows', () => {
  it('baris: ikon garis, nama h3, jumlah apa adanya (tanpa "±"), deskripsi; tanpa Badge/ubin angka', () => {
    const html = rows(ready([entri(1)]));
    expect(html).toContain(`<ul class="${s.rows}" aria-label="Daftar data lingkungan desa">`);
    expect(html).toContain(`<span class="${s.icon}" aria-hidden="true"><svg`);
    expect(html).toContain(`<h3 class="${s.title}">Data 1</h3>`);
    expect(html).toContain(`<p class="${s.amount}">1 paket kegiatan</p>`);
    // Deskripsi CMS dibungkus penetral tema rt.root (dark theme).
    expect(html).toContain(`<div class="${s.prose} ${rt.root}"><p>Deskripsi data 1</p></div>`);
    expect(html).not.toContain('±');
    expect(html).not.toContain('mantine-Badge');
  });

  it('ikon tak dikenal ("icon-test") → baris tanpa ikon, entri tetap tampil', () => {
    const html = rows(ready([entri(1, 'icon-test', '100')]));
    expect(html).not.toContain(s.icon);
    expect(html).toContain(`<h3 class="${s.title}">Data 1</h3>`);
    expect(html).toContain(`<p class="${s.amount}">100</p>`);
  });

  it('cari di klien menyaring baris', () => {
    const html = rows(ready([entri(1), entri(2)]), 'data 2');
    expect(html).toContain('>Data 2</h3>');
    expect(html).not.toContain('>Data 1</h3>');
  });

  it('paginasi klien 10 per halaman; 1 halaman → paginasi tidak dirender', () => {
    const many = Array.from({ length: 11 }, (_, i) => entri(i + 1));
    expect(rows(ready(many))).toContain('aria-label="Halaman daftar data lingkungan"');
    const page2 = rows(ready(many), '', 2);
    expect(page2).toContain('>Data 11</h3>');
    expect(page2).not.toContain('>Data 10</h3>');
    expect(rows(ready([entri(1)]))).not.toContain('Halaman daftar data lingkungan');
  });

  it('memuat: kerangka berdenyut aria-busy', () => {
    const html = rows({ status: 'loading' });
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain(s.placeholderRow);
  });

  it('kosong / cari tanpa hasil / galat → kotak pesan', () => {
    expect(rows(ready([]))).toContain(`<p class="${kabar.empty}">Belum ada data lingkungan desa.</p>`);
    expect(rows(ready([entri(1)]), 'zzz')).toContain('Tidak ada data lingkungan yang cocok dengan “zzz”.');
    expect(rows({ status: 'error' })).toContain('Data lingkungan gagal dimuat. Coba muat ulang halaman.');
  });
});
