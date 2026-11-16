// @vitest-environment node
// Desa Digital publik: sorotan + kartu gaya Kabar (tanpa tanggal), keadaan memuat/kosong/galat, detail 860px.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
import { DesaDigitalBody } from '@/app/(public)/(pages)/inovasi/desa-digital-smart-village/_com/DesaDigitalPage';
import { DesaDigitalDetailBody } from '@/app/(public)/(pages)/inovasi/desa-digital-smart-village/_com/detail/DesaDigitalDetail';
import { toDesaDigitalItem } from '@/app/(public)/(pages)/inovasi/desa-digital-smart-village/_com/desa-digital.logic';
import s from '@/app/(public)/(pages)/inovasi/desa-digital-smart-village/_com/desa-digital.module.css';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: bentuk entri stg 2026-11-16 (dipangkas).
const api = (i: number, link: string | null = `/api/img/dd${i}.webp`) => ({
  id: `dd${i}`,
  name: `Layanan ${i}`,
  deskripsi: `<p>Aplikasi &amp; layanan ${i}</p>`,
  createdAt: '2026-01-20T03:00:00.000Z',
  image: link ? { link } : null,
});
const ready = (list: ReturnType<typeof api>[]) => ({ status: 'ready' as const, items: list.map(toDesaDigitalItem) });
const body = (state: Parameters<typeof DesaDigitalBody>[0]['state'], search = '', page = 1) =>
  render(<DesaDigitalBody state={state} search={search} page={page} onPage={() => {}} />);

describe('DesaDigitalBody', () => {
  it('sorotan = entri pertama, seluruh ubin tautan detail; label "Terbaru"', () => {
    const html = body(ready([api(1), api(2), api(3)]));
    expect(html).toContain(`<a href="/inovasi/desa-digital-smart-village/dd1" class="${kabar.featured}">`);
    expect(html).toContain(`<h2 class="${kabar.featuredTitle}">Layanan 1</h2>`);
    expect(html).toContain(`<span class="${s.label}">Terbaru</span>`);
    expect(html).toContain('Aplikasi &amp; layanan 1');
  });

  it('kartu memakai kelas Kabar, tanpa tanggal, sorotan tidak dobel', () => {
    const html = body(ready([api(1), api(2), api(3)]));
    expect(html).toContain(`class="${kabar.rail} ${kabar.railGrid}"`);
    expect(html).toContain(`<h3 class="${kabar.cardTitle}">Layanan 2</h3>`);
    expect(html).not.toContain(`<h3 class="${kabar.cardTitle}">Layanan 1</h3>`);
    expect(html).toContain('>Layanan digital lainnya</h2>');
    expect(html).not.toContain('<time');
  });

  it('tanpa foto → ikon pengganti; foto berdekorasi alt kosong', () => {
    const html = body(ready([api(1, null), api(2)]));
    expect(html).toContain(kabar.photoFallback);
    expect(html).toContain('alt=""');
  });

  it('cari / halaman 2: tanpa sorotan', () => {
    const searched = body(ready([api(1), api(2)]), 'app');
    expect(searched).not.toContain(kabar.featuredTitle);
    expect(searched).toContain('>Hasil pencarian</h2>');
    expect(searched).toContain(`<h3 class="${kabar.cardTitle}">Layanan 1</h3>`);

    const page2 = body(ready(Array.from({ length: 9 }, (_, i) => api(i + 1))), '', 2);
    expect(page2).not.toContain(kabar.featuredTitle);
    expect(page2).toContain(`<h3 class="${kabar.cardTitle}">Layanan 8</h3>`);
    expect(page2).not.toContain(`<h3 class="${kabar.cardTitle}">Layanan 7</h3>`);
    expect(page2).toContain('aria-label="Halaman daftar layanan digital"');
  });

  it('1 halaman: paginasi tidak dirender', () => {
    expect(body(ready([api(1), api(2), api(3)]))).not.toContain('Halaman daftar layanan digital');
  });

  it('kosong / cari tanpa hasil / galat → kotak pesan', () => {
    expect(body(ready([]))).toContain(`<p class="${kabar.empty}">Belum ada layanan digital.</p>`);
    expect(body(ready([]), 'zzz')).toContain('Tidak ada layanan digital yang cocok dengan “zzz”.');
    expect(body({ status: 'error' })).toContain('Layanan digital gagal dimuat. Coba muat ulang halaman.');
  });

  it('memuat: aria-busy, kerangka sorotan hanya di halaman 1 tanpa cari', () => {
    expect(body({ status: 'loading' })).toContain('aria-busy="true"');
    expect(body({ status: 'loading' })).toContain(`${kabar.featured} ${kabar.placeholder}`);
    expect(body({ status: 'loading' }, 'x')).not.toContain(kabar.featured);
  });

  it('tanpa gaya lama (placeholder "Cari Produk", tombol "Detail")', () => {
    const html = body(ready([api(1), api(2)]));
    expect(html).not.toContain('Cari Produk');
    expect(html).not.toContain('>Detail<');
  });
});

describe('DesaDigitalDetailBody', () => {
  it('kategori, judul h1, foto ke ukuran penuh, isi; tanpa tanggal', () => {
    const html = render(<DesaDigitalDetailBody data={api(1)} />);
    expect(html).toContain(`<span class="${d.kategori}">Desa Digital</span>`);
    expect(html).toContain(`<h1 class="${d.title}">Layanan 1</h1>`);
    expect(html).toContain('href="/api/img/dd1.webp" target="_blank" rel="noopener noreferrer"');
    expect(html).toContain('alt="Layanan 1"');
    expect(html).toContain(`<div class="${d.content}"><p>Aplikasi &amp; layanan 1</p></div>`);
    expect(html).not.toContain('<time');
  });

  it('tanpa foto & isi → bagian itu tidak dirender (tanpa "Tidak ada gambar")', () => {
    const html = render(<DesaDigitalDetailBody data={{ ...api(1, null), deskripsi: '' }} />);
    expect(html).not.toContain(d.photo);
    expect(html).not.toContain(d.content);
    expect(html).not.toContain('Tidak ada gambar');
  });
});
