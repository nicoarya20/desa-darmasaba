// @vitest-environment node
// Keamanan Lingkungan (daftar gaya Kegiatan Desa + detail 860px) & Tips Keamanan (ubin dibaca langsung), yang sejak
// 2026-11-24 menjadi bagian halaman Pencegahan Kriminalitas (`#tips-keamanan`).
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
import { PencegahanContent } from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/PencegahanPage';
import { toPencegahanItem } from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/pencegahan.logic';
import { TipCard } from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/tips/TipCard';
import { TipsSection } from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/tips/TipsSection';
import { toTip } from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/tips/tips-keamanan.logic';
import ts from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/tips/tips-keamanan.module.css';
import { TIPS_KEAMANAN_TEXT } from '@/app/(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/tips/tips-keamanan.text';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';
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
    expect(html).toContain(`<h3 class="${kabar.featuredTitle}"><span class="${r.title}">Kegiatan keamanan 1</span></h3>`);
    expect(html).toContain(`<h3 class="${kabar.cardTitle}"><span class="${r.title}">Kegiatan keamanan 2</span></h3>`);
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
    expect(html).toContain(`class="${d.content} ${rt.root}"><p>Isi kegiatan 1</p>`);
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
    expect(html).toContain(`<div class="${ts.content} ${rt.root}"><p></p><ul><li><p>Kunci pintu</p></li>`);
  });

  it('dengan foto: foto di kolom kiri, judul + isi di kolom kanan', () => {
    const html = render(<TipCard tip={toTip(tips(2, { image: { link: '/api/img/tipu.webp' } }))} />);
    expect(html).toContain(`<figure class="${ts.photo}">`);
    expect(html).toContain('src="/api/img/tipu.webp"');
    expect(html).toContain(`<div class="${ts.body}"><h3 class="${ts.title}">Tips 2</h3><div class="${ts.content} ${rt.root}">`);
  });

  it('tanpa foto & tanpa isi → ubin satu kolom berisi judul saja', () => {
    const html = render(<TipCard tip={toTip(tips(3, { deskripsi: '<p></p>' }))} />);
    expect(html).toContain(`class="${ts.tip} ${ts.tipSolo}"`);
    expect(html).not.toContain(ts.body);
  });
});

// test-only: state siap tips & program Pencegahan (bentuk entri stg, dipangkas).
const tipsReady = (list: ReturnType<typeof tips>[]) =>
  ({ status: 'ready', tips: list.map(toTip), totalPages: 1, total: list.length }) as const;
const program = (i: number) =>
  toPencegahanItem({
    id: `pk${i}`,
    judul: `Program ${i}`,
    deskripsiSingkat: `<p>Ringkasan ${i}</p>`,
    deskripsi: `<p>Isi ${i}</p>`,
    linkVideo: '',
    createdAt: '2026-07-20T07:54:34.161Z',
  });

describe('TipsSection (bagian tips di Pencegahan Kriminalitas)', () => {
  it('h2 "Tips keamanan" + pengantar, anchor #tips-keamanan, semua tips tampil langsung tanpa tautan/paginasi', () => {
    const html = render(<TipsSection state={tipsReady([tips(1), tips(2)])} />);
    expect(html).toMatch(/<section id="tips-keamanan"[^>]*aria-labelledby="tips-keamanan-judul"/);
    expect(html).toMatch(/<h2 id="tips-keamanan-judul"[^>]*>Tips keamanan<\/h2>/);
    expect(html).toContain(TIPS_KEAMANAN_TEXT.lead);
    expect(html).toContain('>Tips 1</h3>');
    expect(html).toContain('>Tips 2</h3>');
    expect(html).not.toContain('<a ');
    expect(html).not.toMatch(/Halaman daftar tips/);
  });

  it('tidak ada tips (atau tidak cocok kata kunci) → bagian tidak dirender sama sekali', () => {
    expect(render(<TipsSection state={tipsReady([])} />)).toBe('');
  });

  it('memuat → kerangka berdenyut; galat → pesan role=alert, judul bagian tetap', () => {
    const loading = render(<TipsSection state={{ status: 'loading' }} />);
    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain('aria-label="Memuat tips keamanan"');
    const error = render(<TipsSection state={{ status: 'error' }} />);
    expect(error).toContain('role="alert"');
    expect(error).toContain('Tips keamanan gagal dimuat. Coba muat ulang halaman.');
    expect(error).toContain('>Tips keamanan</h2>');
  });

  it('teks pengantar sesuai konteks tips (bukan salinan Pecalang/Patwal), tanpa em dash', () => {
    expect(TIPS_KEAMANAN_TEXT.lead).not.toMatch(/Pecalang|Patwal/);
    expect(JSON.stringify(TIPS_KEAMANAN_TEXT)).not.toContain('—');
  });
});

describe('PencegahanContent (program + tips dalam satu halaman)', () => {
  const content = (
    programState: Parameters<typeof PencegahanContent>[0]['state'],
    tipsState: Parameters<typeof PencegahanContent>[0]['tips'],
    search = '',
  ) => render(<PencegahanContent state={programState} tips={tipsState} search={search} page={1} onPage={() => {}} />);

  it('program dulu, lalu bagian tips', () => {
    const html = content({ status: 'ready', items: [program(1), program(2)] }, tipsReady([tips(1)]));
    expect(html.indexOf('Program 1')).toBeGreaterThan(-1);
    expect(html.indexOf('Program 1')).toBeLessThan(html.indexOf('id="tips-keamanan"'));
  });

  it('cari tanpa hasil di program maupun tips → satu pesan gabungan, tanpa dua kotak kosong', () => {
    const html = content({ status: 'ready', items: [] }, tipsReady([]), 'maling');
    expect(html).toBe(`<p class="${kabar.empty}">Tidak ada program atau tips yang cocok dengan “maling”.</p>`);
  });

  it('cari: program tidak cocok tetapi tips cocok → bagian program disembunyikan, tips tampil', () => {
    const html = content({ status: 'ready', items: [] }, tipsReady([tips(1)]), 'kunci');
    expect(html).not.toContain('Tidak ada program');
    expect(html).toContain('>Tips 1</h3>');
  });

  it('tanpa kata kunci: belum ada program → pesan program tetap tampil, tips di bawahnya', () => {
    const html = content({ status: 'ready', items: [] }, tipsReady([tips(1)]));
    expect(html).toContain('Belum ada program pencegahan kriminalitas.');
    expect(html).toContain('>Tips 1</h3>');
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
