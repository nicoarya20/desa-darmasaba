// @vitest-environment node
// Hover sapuan warna (fase 1, beranda): judul kartu/baris = span `.title` di dalam judul, tautan aksi =
// label `.cta` + `data-text` (cadangan lebar versi tebal) + chevron `.chevron`, induk yang di-hover = `.trigger`.
// jsdom gagal start di repo ini, jadi markup diuji lewat renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

// test-only: entri berita/pengumuman siap tampil.
const item = (id: string): KabarItem => ({
  id,
  title: `Judul ${id}`,
  summary: 'Ringkasan',
  kategori: 'Budaya',
  createdAt: Date.UTC(2026, 10, 3, 2),
  href: `/pemerintahan/berita/Budaya/${id}`,
});

const kabarData = vi.hoisted(() => ({ value: { berita: [] as unknown[], pengumuman: [] as unknown[], loading: false, failed: false } }));
vi.mock('@/app/(public)/_com/main-page/kabar-desa/use-kabar-data', () => ({ useKabarData: () => kabarData.value }));

import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import KabarDesa from '@/app/(public)/_com/main-page/kabar-desa';
import { KabarBerita } from '@/app/(public)/_com/main-page/kabar-desa/KabarBerita';
import { KabarPengumuman } from '@/app/(public)/_com/main-page/kabar-desa/KabarPengumuman';
import type { KabarItem } from '@/app/(public)/_com/main-page/kabar-desa/kabar.logic';
import s from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import p from '@/app/(public)/_com/main-page/kabar-desa/kabar.pengumuman.module.css';
import { KABAR_TEXT } from '@/app/(public)/_com/main-page/kabar-desa/kabar.text';
import LayananMasyarakat from '@/app/(public)/_com/main-page/layanan-masyarakat';
import l from '@/app/(public)/_com/main-page/layanan-masyarakat/layanan-masyarakat.module.css';
import { KesejahteraanCards } from '@/app/(public)/(pages)/ekonomi/kesejahteraan-masyarakat/_com/KesejahteraanCards';
import { LAYANAN_DESA } from '@/con/layanan-desa';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const SRC = (rel: string) => readFileSync(path.resolve(__dirname, '../../src', rel), 'utf8');

const count = (html: string, needle: string) => html.split(needle).length - 1;

/** Potongan markup pertama yang cocok dengan pola (string kosong bila tidak ada). */
const openTag = (html: string, re: RegExp) => html.match(re)?.[0] ?? '';

/** Teks yang terbaca pembaca layar: tag dibuang, atribut (data-text) tidak ikut. */
const visibleText = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

describe('KabarBerita: judul = span .title di dalam h3, kartu = .trigger', () => {
  const html = render(<KabarBerita items={['a', 'b', 'c', 'd'].map(item)} loading={false} />);

  it('kartu utama dan 3 kartu kecil memasang kelas pemicu di tautan', () => {
    expect(html).toContain(`class="${s.featured} ${r.trigger}"`);
    expect(count(html, `class="${s.card} ${r.trigger}"`)).toBe(3);
  });

  it('span sapuan berada DI DALAM elemen judul (judul ber-line-clamp tetap blok)', () => {
    expect(html).toContain(`<h3 class="${s.featuredTitle}"><span class="${r.title}">Judul a</span></h3>`);
    for (const id of ['b', 'c', 'd']) {
      expect(html).toContain(`<h3 class="${s.cardTitle}"><span class="${r.title}">Judul ${id}</span></h3>`);
    }
  });

  it('kerangka memuat tidak memasang pemicu/sapuan', () => {
    const loading = render(<KabarBerita items={[]} loading />);
    expect(loading).not.toContain(r.trigger);
    expect(loading).not.toContain(`class="${r.title}"`);
  });
});

describe('KabarPengumuman: baris judul & "Semua pengumuman"', () => {
  const html = render(<KabarPengumuman items={[item('x'), item('y')]} loading={false} />);

  it('baris = .trigger, judul baris dibungkus span .title di dalam .rowTitle', () => {
    expect(count(html, `class="${p.row} ${r.trigger}"`)).toBe(2);
    expect(html).toContain(`<span class="${p.rowTitle}"><span class="${r.title}">Judul x</span></span>`);
  });

  it('tautan aksi: label .cta + data-text sama dengan teks, chevron .chevron aria-hidden', () => {
    const link = openTag(html, /<a[^>]*href="\/pemerintahan\/pengumuman"[^>]*>[\s\S]*?<\/a>/);
    expect(link).toContain(`class="${p.textLink} ${r.trigger}"`);
    expect(link).toContain(
      `<span class="${r.cta}" data-text="${KABAR_TEXT.pengumumanAll}">${KABAR_TEXT.pengumumanAll}</span>`,
    );
    const svg = openTag(link, /<svg[^>]*>/);
    expect(svg).toMatch(new RegExp(`class="[^"]*\\b${r.chevron}\\b`));
    expect(svg).toContain('aria-hidden="true"');
  });

  it('teks aksi hanya terbaca sekali (salinan tebal lewat atribut + ::after tersembunyi)', () => {
    const link = openTag(html, /<a[^>]*href="\/pemerintahan\/pengumuman"[^>]*>[\s\S]*?<\/a>/);
    expect(count(visibleText(link), KABAR_TEXT.pengumumanAll)).toBe(1);
  });
});

describe('KabarDesa: "Lihat semua berita"', () => {
  it('label .cta + data-text, chevron .chevron, tautan = .trigger; teks terbaca sekali', () => {
    kabarData.value = { berita: [item('a'), item('b')], pengumuman: [], loading: false, failed: false };
    const html = render(<KabarDesa />);
    const link = openTag(html, /<a[^>]*href="\/pemerintahan\/berita\/semua"[^>]*>[\s\S]*?<\/a>/);
    expect(link).toContain(`class="${s.allLink} ${r.trigger}"`);
    expect(link).toContain(`<span class="${r.cta}" data-text="${KABAR_TEXT.beritaAll}">${KABAR_TEXT.beritaAll}</span>`);
    expect(openTag(link, /<svg[^>]*>/)).toMatch(new RegExp(`class="[^"]*\\b${r.chevron}\\b`));
    expect(count(visibleText(link), KABAR_TEXT.beritaAll)).toBe(1);
  });
});

describe('LayananMasyarakat: label aksi kartu', () => {
  const html = render(<LayananMasyarakat />);

  it('4 kartu (3 <a> + 1 <button>) memasang .trigger', () => {
    expect(count(html, `${l.card} ${r.trigger}`)).toBe(LAYANAN_DESA.length);
    expect(openTag(html, /<button[^>]*>/)).toContain(`${l.card} ${r.trigger}`);
  });

  it('label = .ctaLabel + .cta dengan data-text = teks aksi; teks terbaca sekali per kartu', () => {
    for (const layanan of LAYANAN_DESA) {
      expect(html).toContain(`<span class="${l.ctaLabel} ${r.cta}" data-text="${layanan.cta}">${layanan.cta}</span>`);
      expect(count(visibleText(html), layanan.cta)).toBe(1);
    }
    expect(html.match(new RegExp(`<svg[^>]*class="[^"]*\\b${r.chevron}\\b`, 'g'))).toHaveLength(LAYANAN_DESA.length);
  });
});

describe('Pemakai kelas kartu Kabar di luar beranda', () => {
  it('KesejahteraanCards: kartu = .trigger, judul dibungkus span .title', () => {
    const html = render(
      <KesejahteraanCards
        items={[{ id: 'k1', title: 'Bantuan Pangan', summary: '', href: '/ekonomi/kesejahteraan-masyarakat/k1', searchText: 'bantuan pangan' }]}
      />,
    );
    expect(html).toContain(`class="${s.card} ${r.trigger}"`);
    expect(html).toContain(`<h3 class="${s.cardTitle}"><span class="${r.title}">Bantuan Pangan</span></h3>`);
  });
});

describe('CSS', () => {
  const BERANDA_CSS = [
    'app/(public)/_com/main-page/kabar-desa/kabar.module.css',
    'app/(public)/_com/main-page/kabar-desa/kabar.pengumuman.module.css',
    'app/(public)/_com/main-page/layanan-masyarakat/layanan-masyarakat.module.css',
  ];

  it('garis bawah hover lama sudah dihapus dari 3 file beranda', () => {
    for (const file of BERANDA_CSS) expect(SRC(file)).not.toMatch(/text-decoration:\s*underline/);
  });

  const css = SRC('app/(public)/_com/link-reveal/link-reveal.module.css');

  it('sapuan memakai background-clip text tanpa prefiks manual (Lightning CSS menambah sendiri)', () => {
    expect(css).toContain('background-clip: text;');
    expect(css).not.toContain('-webkit-background-clip');
    expect(css).toContain('box-decoration-break: slice;');
    expect(css).toContain('background-size: 200% 100%;');
  });

  it('hover hanya pointer halus; fokus keyboard ikut memicu; reduced motion & forced colors ditangani', () => {
    expect(css).toMatch(/@media \(hover: hover\) and \(pointer: fine\) \{\s*\.trigger:hover \.title/);
    expect(css).toContain('.trigger:focus-visible .title');
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{[^}]*transition: none;/);
    expect(css).toMatch(/@media \(forced-colors: active\) \{[\s\S]*background-image: none;[\s\S]*text-decoration: underline;/);
  });

  it('warna target ikut tema: judul → token brand, aksi → #1C6EA4 terang / --c-ink gelap', () => {
    // Blok yang selektornya persis satu kelas (blok bersama ".title,\n.cta" tidak memuat --reveal-to).
    const block = (sel: string) =>
      css.split('}').find((b) => b.replace(/\/\*[\s\S]*?\*\//g, '').split('{')[0].trim() === sel) ?? '';
    // Terang tetap #0A4E78 lewat token (--c-brand terang = #0a4e78, dikunci theme_tokens_contrast.test.ts).
    expect(block('.title')).toContain('--reveal-to: var(--c-brand);');
    // #1C6EA4 di latar gelap hanya ±3:1, --c-brand-hover ±1,2:1 terhadap brand → gelap pakai --c-ink (putih).
    expect(block('.cta')).toContain('--reveal-to: light-dark(#1c6ea4, var(--c-ink));');
    expect(css).not.toMatch(/--reveal-to:\s*#/);
  });

  it('salinan tebal ::after tidak terlihat & tidak dibaca (visibility hidden, tinggi 0)', () => {
    const after = css.match(/\.cta::after \{[^}]*\}/)?.[0] ?? '';
    expect(after).toContain('content: attr(data-text);');
    expect(after).toContain('visibility: hidden;');
    expect(after).toContain('height: 0;');
    expect(after).toContain('font-weight: 700;');
  });

  it('label aksi Layanan tetap tersembunyi di ponsel meski .cta memberi display', () => {
    expect(SRC(BERANDA_CSS[2])).toMatch(/\.cardCta \.ctaLabel \{\s*display: none;/);
  });
});
