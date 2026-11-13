// @vitest-environment node
// Keamanan Lingkungan (daftar gaya Kegiatan Desa + detail 860px) & Tips Keamanan (ubin dibaca langsung).
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
import { KeamananLingkunganDetailBody } from '@/app/(public)/(pages)/keamanan/keamanan-lingkungan-pecalang-patwal/_com/detail/KeamananLingkunganDetail';
import { KeamananLingkunganBody } from '@/app/(public)/(pages)/keamanan/keamanan-lingkungan-pecalang-patwal/_com/KeamananLingkunganPage';
import { toKeamananLingkunganItem } from '@/app/(public)/(pages)/keamanan/keamanan-lingkungan-pecalang-patwal/_com/keamanan-lingkungan.logic';
import { TipCard } from '@/app/(public)/(pages)/keamanan/tips-keamanan/_com/TipCard';
import { TipsKeamananBody } from '@/app/(public)/(pages)/keamanan/tips-keamanan/_com/TipsKeamananPage';
import { toTip } from '@/app/(public)/(pages)/keamanan/tips-keamanan/_com/tips-keamanan.logic';
import ts from '@/app/(public)/(pages)/keamanan/tips-keamanan/_com/tips-keamanan.module.css';
import { TIPS_KEAMANAN_TEXT } from '@/app/(public)/(pages)/keamanan/tips-keamanan/_com/tips-keamanan.text';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: entri stg 2026-11-12 (dipangkas).
const entri = (i: number) => ({
  id: `kl${i}`,
  name: `Kegiatan keamanan ${i}`,
  deskripsi: `<p>Isi kegiatan ${i}</p>`,
  createdAt: '2026-04-14T07:38:56.519Z',
  image: { link: `/api/img/kl${i}.webp` },
});
// test-only
const tips = (i: number, extra: Partial<{ deskripsi: string | null; image: { link: string } | null }> = {}) => ({
  id: `t${i}`,
  judul: `Tips ${i}`,
  deskripsi: '<p></p><ul><li><p>Kunci pintu</p></li><li><p>Pasang lampu</p></li></ul><p></p>',
  image: null,
  ...extra,
});

const klState = (items: ReturnType<typeof entri>[], totalPages = 1) => ({
  items: items.map(toKeamananLingkunganItem),
  totalPages,
  loading: false,
  failed: false,
});
const klBody = (state: Parameters<typeof KeamananLingkunganBody>[0]['state'], search = '') =>
  render(<KeamananLingkunganBody state={state} search={search} page={1} onPage={() => {}} />);

describe('KeamananLingkunganBody', () => {
  it('kartu gaya Kegiatan Desa: 1 utama + kartu kecil bertautan detail, tanpa tombol Detail/justify lama', () => {
    const html = klBody(klState([entri(1), entri(2), entri(3)]));
    expect(html).toContain(`<h3 class="${kabar.featuredTitle}">Kegiatan keamanan 1</h3>`);
    expect(html).toContain(`<h3 class="${kabar.cardTitle}">Kegiatan keamanan 2</h3>`);
    expect(html).toContain('href="/keamanan/keamanan-lingkungan-pecalang-patwal/kl3"');
    expect(html).toContain('Isi kegiatan 1');
    expect(html).not.toContain('>Detail<');
    expect(html).not.toContain('justify');
  });

  it('1 halaman → tanpa paginasi; > 1 halaman → paginasi', () => {
    expect(klBody(klState([entri(1)]))).not.toContain('aria-label="Halaman daftar keamanan lingkungan"');
    expect(klBody(klState([entri(1)], 2))).toContain('aria-label="Halaman daftar keamanan lingkungan"');
  });

  it('kosong / cari tanpa hasil / galat → kotak pesan jujur', () => {
    expect(klBody(klState([]))).toContain(`<p class="${kabar.empty}">Belum ada informasi keamanan lingkungan.</p>`);
    expect(klBody(klState([]), 'ronda')).toContain('Tidak ada informasi keamanan lingkungan yang cocok dengan “ronda”.');
    expect(klBody({ items: [], totalPages: 1, loading: false, failed: true })).toContain(
      'Keamanan lingkungan gagal dimuat. Coba muat ulang halaman.',
    );
  });

  it('memuat → kerangka kartu', () => {
    const html = klBody({ items: [], totalPages: 1, loading: true, failed: false });
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('aria-label="Memuat keamanan lingkungan"');
  });
});

describe('KeamananLingkunganDetailBody', () => {
  it('tanggal WITA, judul h1, foto ukuran penuh, isi HTML; tanpa label "Deskripsi"', () => {
    const html = render(<KeamananLingkunganDetailBody data={entri(1)} />);
    expect(html).toContain('Selasa, 14 April 2026');
    expect(html).toContain(`<h1 class="${d.title}">Kegiatan keamanan 1</h1>`);
    expect(html).toContain(`<figure class="${d.photo}">`);
    expect(html).toContain('href="/api/img/kl1.webp" target="_blank"');
    expect(html).toContain(`class="${d.content}"><p>Isi kegiatan 1</p>`);
    expect(html).not.toContain('Deskripsi');
  });

  it('tanpa foto & isi kosong → bagian itu tidak dirender (tanpa "-")', () => {
    const html = render(<KeamananLingkunganDetailBody data={{ ...entri(2), image: null, deskripsi: '<p></p>' }} />);
    expect(html).not.toContain(d.photo);
    expect(html).not.toContain(d.content);
    expect(html).not.toContain('>-<');
  });
});

describe('TipCard', () => {
  it('tanpa foto: tanpa placeholder "No image"; judul di kolom kiri, butir HTML di kolom kanan', () => {
    const html = render(<TipCard tip={toTip(tips(1))} />);
    expect(html).not.toContain('no-image');
    expect(html).not.toContain('<img');
    expect(html).toContain(`<div class="${ts.aside}"><h3 class="${ts.title}">Tips 1</h3></div>`);
    expect(html).toContain(`<div class="${ts.content}"><p></p><ul><li><p>Kunci pintu</p></li>`);
  });

  it('dengan foto: foto di kolom kiri, judul + isi di kolom kanan', () => {
    const html = render(<TipCard tip={toTip(tips(2, { image: { link: '/api/img/tipu.webp' } }))} />);
    expect(html).toContain(`<figure class="${ts.photo}">`);
    expect(html).toContain('src="/api/img/tipu.webp"');
    expect(html).toContain(`<div class="${ts.body}"><h3 class="${ts.title}">Tips 2</h3><div class="${ts.content}">`);
  });

  it('tanpa foto & tanpa isi → ubin satu kolom berisi judul saja', () => {
    const html = render(<TipCard tip={toTip(tips(3, { deskripsi: '<p></p>' }))} />);
    expect(html).toContain(`class="${ts.tip} ${ts.tipSolo}"`);
    expect(html).not.toContain(ts.body);
  });
});

describe('TipsKeamananBody', () => {
  const body = (state: Parameters<typeof TipsKeamananBody>[0]['state'], search = '') =>
    render(<TipsKeamananBody state={state} search={search} page={1} onPage={() => {}} />);

  it('semua tips tampil langsung (tanpa tautan detail); 1 halaman → tanpa paginasi', () => {
    const html = body({ status: 'ready', tips: [toTip(tips(1)), toTip(tips(2))], totalPages: 1, total: 2 });
    expect(html).toContain('>Tips 1</h3>');
    expect(html).toContain('>Tips 2</h3>');
    expect(html).not.toContain('<a ');
    expect(html).not.toContain(`aria-label="${TIPS_KEAMANAN_TEXT.paginationLabel}"`);
  });

  it('> 1 halaman → paginasi', () => {
    const html = body({ status: 'ready', tips: [toTip(tips(1))], totalPages: 2, total: 11 });
    expect(html).toContain(`aria-label="${TIPS_KEAMANAN_TEXT.paginationLabel}"`);
  });

  it('kosong / cari tanpa hasil / galat / memuat', () => {
    expect(body({ status: 'ready', tips: [], totalPages: 1, total: 0 })).toContain(`<p class="${kabar.empty}">Belum ada tips keamanan.</p>`);
    expect(body({ status: 'ready', tips: [], totalPages: 1, total: 0 }, 'kunci')).toContain(
      'Tidak ada tips keamanan yang cocok dengan “kunci”.',
    );
    expect(body({ status: 'error' })).toContain('Tips keamanan gagal dimuat. Coba muat ulang halaman.');
    const loading = body({ status: 'loading' });
    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain('aria-label="Memuat tips keamanan"');
  });

  it('teks pengantar sesuai konteks tips (bukan salinan Pecalang/Patwal), tanpa em dash', () => {
    expect(TIPS_KEAMANAN_TEXT.lead).not.toMatch(/Pecalang|Patwal/);
    expect(JSON.stringify(TIPS_KEAMANAN_TEXT)).not.toContain('—');
  });
});

describe('KabarListHeader searchable', () => {
  const header = (searchable?: boolean) =>
    render(
      <KabarListHeader
        title="Tips Keamanan"
        lead="Pengantar"
        searchLabel="Cari tips keamanan"
        searchPlaceholder="Cari tips keamanan"
        kategoriLabel="Kategori"
        tabs={[]}
        search=""
        onSearch={() => {}}
        {...(searchable === undefined ? {} : { searchable })}
      />,
    );

  it('bawaan (prop tidak diisi) → kolom cari tetap dirender untuk pemakai lain', () => {
    const html = header();
    expect(html).toContain('role="search"');
    expect(html).toContain('placeholder="Cari tips keamanan"');
  });

  it('searchable=false → tanpa form cari, judul & pengantar tetap', () => {
    const html = header(false);
    expect(html).not.toContain('role="search"');
    expect(html).not.toContain('type="search"');
    expect(html).toContain('Tips Keamanan');
    expect(html).toContain('Pengantar');
  });
});
