// @vitest-environment node
// Katalog Perpustakaan Digital publik: kartu buku (satu tautan, tanpa tombol), badan daftar (memuat/galat/kosong/
// cari kosong/kategori kosong/grid), baris alat, dan rakitan halaman (pil kategori dari URL lama).
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup; interaksi diverifikasi manual di browser.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LoadState } from '@/app/(public)/_com/lazy-load/use-lazy-load';
import type { Buku } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus.types';

const h = vi.hoisted(() => ({
  state: { status: 'loading' } as LoadState<Buku[]>,
  params: new URLSearchParams(),
}));

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => h.params,
  usePathname: () => '/pendidikan/perpustakaan-digital/semua',
}));
vi.mock('@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/PerpusDataProvider', () => ({
  usePerpusData: () => ({ state: h.state, retry: () => undefined }),
}));

import { BukuCard } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/BukuCard';
import { PerpusDaftar } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/PerpusDaftar';
import { PerpusKatalog } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/PerpusKatalog';
import { PERPUS_SKELETON_COUNT } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus.meta';
import { PERPUS_TEXT as T } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus.text';
import c from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/buku-card.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import k from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus-katalog.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const count = (html: string, needle: string) => html.split(needle).length - 1;
const noop = () => {};

// test-only: bentuk hasil adapter.
const buku = (id: string, over: Partial<Buku> = {}): Buku => ({
  id,
  judul: `Buku ${id}`,
  deskripsiHtml: '',
  ringkasan: '',
  kategori: { id: 'k1', nama: 'Anak Dan Remaja', slug: 'anak-dan-remaja' },
  sampul: null,
  dibuat: 0,
  ...over,
});
const DATA = [
  buku('a', { judul: 'Dongeng Bali', sampul: 'https://cdn.example.test/a.jpg', dibuat: 2 }),
  buku('b', { judul: 'Atlas Dunia', kategori: { id: 'k2', nama: 'Sains', slug: 'sains' }, dibuat: 1 }),
];
const ready = (data: Buku[]): LoadState<Buku[]> => ({ status: 'ready', data });

const daftar = (state: LoadState<Buku[]>, over: { slug?: string; search?: string } = {}) =>
  render(
    <PerpusDaftar
      state={state}
      slug={over.slug ?? 'semua'}
      search={over.search ?? ''}
      urut="terbaru"
      onUrut={noop}
      onClearSearch={noop}
      onRetry={noop}
    />,
  );

beforeEach(() => {
  h.state = { status: 'loading' };
  h.params = new URLSearchParams();
});

describe('BukuCard', () => {
  it('seluruh kartu satu tautan ke detail; judul h3 + kategori; tanpa tombol dan deskripsi', () => {
    const html = render(<BukuCard buku={DATA[0]} />);
    expect(count(html, '<a ')).toBe(1);
    expect(count(html, '<button')).toBe(0);
    expect(html).toMatch(/^<a [^>]*href="\/pendidikan\/perpustakaan-digital\/anak-dan-remaja\/a"/);
    expect(html).toMatch(new RegExp(`^<a [^>]*class="${c.card} ${r.trigger}"`));
    expect(html).toContain(`<h3 class="${c.title}"><span class="${r.title}">Dongeng Bali</span></h3>`);
    expect(text(html)).toBe('Dongeng Bali Anak Dan Remaja');
    expect(html).toMatch(/<img [^>]*src="https:\/\/cdn.example.test\/a.jpg"[^>]*alt="Dongeng Bali"|<img [^>]*alt="Dongeng Bali"[^>]*src=/);
    expect(html).toContain('loading="lazy"');
  });

  it('tanpa sampul → ikon pengganti tersembunyi; tanpa kategori → baris kategori tidak ada', () => {
    const html = render(<BukuCard buku={buku('x', { kategori: null })} />);
    expect(html).not.toContain('<img');
    expect(html).toContain('aria-hidden="true"><svg');
    expect(html).not.toContain(c.kategori);
    expect(html).toContain('href="/pendidikan/perpustakaan-digital/semua/x"');
  });
});

describe('PerpusDaftar', () => {
  it(`memuat → ${PERPUS_SKELETON_COUNT} kartu kerangka, aria-busy`, () => {
    const html = daftar({ status: 'loading' });
    expect(html).toContain('aria-busy="true"');
    expect(count(html, `class="${k.skeleton}"`)).toBe(PERPUS_SKELETON_COUNT);
  });

  it('galat → alert + tombol Coba lagi', () => {
    const html = daftar({ status: 'error' } as LoadState<Buku[]>);
    expect(html).toContain('role="alert"');
    expect(text(html)).toBe(`${T.gagalTitle} ${T.gagalDesc} ${T.cobaLagi}`);
  });

  it('data kosong → Belum ada buku, tanpa baris alat', () => {
    const html = daftar(ready([]));
    expect(text(html)).toBe(`${T.kosongTitle} ${T.kosongDesc}`);
    expect(html).not.toContain('<h2');
  });

  it('siap → "n buku" + grid; Urutkan tampil bila > 1 buku', () => {
    const html = daftar(ready(DATA));
    expect(html).toContain(`<h2 class="${k.count}">2 buku</h2>`);
    expect(count(html, `class="${k.item}"`)).toBe(2);
    expect(html).toContain(`>${T.urutkan}</label>`);
    expect(text(html).indexOf('Dongeng Bali')).toBeLessThan(text(html).indexOf('Atlas Dunia'));
  });

  it('satu buku → tanpa Urutkan', () => {
    expect(daftar(ready([DATA[0]]))).not.toContain(T.urutkan);
  });

  it('cari → "n buku dari m"; cari kosong → pesan + Hapus kata kunci', () => {
    expect(text(daftar(ready(DATA), { search: 'atlas' }))).toContain('1 buku dari 2');
    const kosong = daftar(ready(DATA), { search: 'zzz' });
    expect(text(kosong)).toContain(`${T.cariKosongTitle} ${T.cariKosongDesc('zzz')} ${T.hapusCari}`);
    expect(text(kosong)).toContain('0 buku dari 2');
  });

  it('kategori tanpa buku (tautan lama/kosong) → Belum ada buku di kategori itu', () => {
    expect(text(daftar(ready(DATA), { slug: 'sejarah-bali' }))).toContain(T.kosongKategori('sejarah bali'));
  });
});

describe('PerpusKatalog', () => {
  it('h1 nama menu, kolom cari, pil Semua + kategori berbuku; pil aktif dari slug', () => {
    h.state = ready(DATA);
    const html = render(<PerpusKatalog slugParam="sains" />);
    expect(count(html, '<h1')).toBe(1);
    expect(html).toContain(`>${T.title}</h1>`);
    expect(html).toContain(`placeholder="${T.searchPlaceholder}"`);
    for (const label of ['Semua', 'Anak Dan Remaja', 'Sains']) expect(text(html)).toContain(label);
    expect(html).toMatch(/aria-current="page"[^>]*>Sains|href="\/pendidikan\/perpustakaan-digital\/sains"[^>]*aria-current/);
    expect(text(html)).toContain('1 buku');
    expect(html).not.toContain('Dongeng Bali');
  });

  it('tautan lama ter-encode (/Anak%20Dan%20Remaja) dan ?search= tetap terbaca', () => {
    h.state = ready(DATA);
    h.params = new URLSearchParams('search=dongeng');
    const html = render(<PerpusKatalog slugParam="Anak%20Dan%20Remaja" />);
    expect(html).toContain('Dongeng Bali');
    expect(html).not.toContain('Atlas Dunia');
    expect(html).toContain('value="dongeng"');
    expect(html).toContain('href="/pendidikan/perpustakaan-digital/semua?search=dongeng"');
  });
});
