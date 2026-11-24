// @vitest-environment node
// Tema gelap Fase 2: modul bersama situs publik (_com/kabar-list, stat-bars, struktur-organisasi, kontak-darurat,
// program-tiles, not-found, peta-informasi) membaca warna dari token --c-* (theme-tokens.css). Tema terang wajib
// identik: alias token bernilai terang sama dengan literal lama, nilai lokal yang beda token memakai light-dark().
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import GaleriFoto from '@/app/(public)/_com/konten-bersama/galeri-foto.grid';
import { KONTAK_BRAND_VARS } from '@/app/(public)/_com/kontak-darurat/kontak-darurat.meta';
import { STAT_BARS_VARS, statSegmentColor } from '@/app/(public)/_com/stat-bars/stat-bars.meta';
import type { FotoGaleriItem } from '@/lib/konten-bersama/konten-bersama.types';

const PUB = (rel: string) => readFileSync(path.resolve(__dirname, '../../src/app/(public)', rel), 'utf8');
const TOKENS = readFileSync(path.resolve(__dirname, '../../src/app/theme-tokens.css'), 'utf8');

/** Isi blok selektor pertama yang persis `sel {` sampai `}` penutup level atas. */
const blockOf = (css: string, sel: string) => {
  const start = css.indexOf(`${sel} {`);
  return start < 0 ? '' : css.slice(start, css.indexOf('\n}', start));
};
/** CSS tanpa komentar: hex di komentar penjelas (mis. nilai token gelap) bukan literal warna. */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const decl = (block: string, name: string) => block.match(new RegExp(`(?:^|[\\s;{])${name}:\\s*([^;]+);`))?.[1].trim();

/** Nilai terang token --c-* dari blok :root (sumber tunggal). */
const lightToken = (name: string) => TOKENS.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();

describe('token terang = literal lama yang digantikan (tema terang identik)', () => {
  it.each([
    ['c-tile', '#f5f5f7'],
    ['c-tile-alt', '#fff'],
    ['c-placeholder', '#e8e8ed'],
    ['c-brand-fill', '#0a4e78'],
    ['c-brand-fill-hover', '#083f61'],
    ['c-on-brand', '#fff'],
    ['c-chart-2', '#2f91cc'],
    ['c-chart-3', '#8ac1e3'],
    ['c-brand-tint', '#e5f2fa'],
    ['c-line-strong', '#d2d2d7'],
  ])('%s = %s', (token, legacy) => {
    expect(lightToken(token)).toBe(legacy);
  });
});

describe('kabar-list: tombol isi & latar dari token', () => {
  const css = PUB('_com/kabar-list/kabar-list.module.css');
  it('pil & paginasi aktif memakai --c-brand-fill + --c-on-brand (bukan --brand teks)', () => {
    for (const sel of ['.pill[aria-current="page"]', '.pageControl[data-active]']) {
      const b = blockOf(css, sel);
      expect(decl(b, 'background'), sel).toBe('var(--c-brand-fill)');
      expect(decl(b, 'color'), sel).toBe('var(--c-on-brand)');
    }
  });
  it('tanpa literal hex tersisa di daftar & detail', () => {
    expect(stripComments(css)).not.toMatch(/#[0-9a-f]{3,6}\b/i);
    expect(stripComments(PUB('_com/kabar-list/kabar-detail.module.css'))).not.toMatch(/:\s*#[0-9a-f]{3,6}\b/i);
  });
});

describe('stat-bars: panel & segmen ikut tema', () => {
  it('--sb-* = alias token, latar panel/ubin = --c-tile', () => {
    for (const [file, sel] of [
      ['_com/stat-bars/stat-bars.module.css', '.panel'],
      ['_com/stat-bars/stat-bars-states.module.css', '.empty'],
    ] as const) {
      const b = blockOf(PUB(file), sel);
      expect(decl(b, '--sb-ink')).toBe('var(--c-ink)');
      expect(decl(b, '--sb-muted')).toBe('var(--c-muted)');
      expect(decl(b, 'background')).toBe('var(--c-tile)');
    }
  });
  it('STAT_BARS_VARS hanya berisi var() token, tidak ada hex', () => {
    expect(STAT_BARS_VARS).toEqual({
      '--stat-seg-0': 'var(--brand)',
      '--stat-seg-1': 'var(--c-chart-2)',
      '--stat-seg-2': 'var(--c-chart-3)',
      '--stat-tint': 'var(--c-brand-tint)',
    });
    expect(statSegmentColor(7)).toBe('var(--stat-seg-2)');
  });
});

describe('kontak-darurat: tombol Telepon & brand', () => {
  it('KONTAK_BRAND_VARS = token (pemakai inline otomatis ikut gelap)', () => {
    expect(KONTAK_BRAND_VARS).toEqual({ '--brand': 'var(--c-brand)', '--brand-hover': 'var(--c-brand-hover)' });
  });
  it('.btnCall memakai token fill; latar putih lama jadi --c-tile-alt', () => {
    const css = PUB('_com/kontak-darurat/kontak-darurat.module.css');
    const call = blockOf(css, '.btnCall');
    expect(decl(call, 'background')).toBe('var(--c-brand-fill)');
    expect(decl(call, 'color')).toBe('var(--c-on-brand)');
    expect(css).not.toMatch(/background:\s*#fff/);
  });
  it('merah darurat punya nilai gelap', () => {
    const grid = blockOf(PUB('_com/kontak-darurat/kontak-nasional.module.css'), '.grid');
    expect(decl(grid, '--emergency')).toBe('light-dark(#d70015, #ff453a)');
  });
});

describe('struktur-organisasi: pil nama, kartu kosong, garis', () => {
  const card = PUB('_com/struktur-organisasi/struktur-card.module.css');
  it('pil nama terang #fff, gelap pelat #d9e1ea', () => {
    expect(decl(blockOf(card, '.name'), 'background')).toBe('light-dark(#fff, #d9e1ea)');
  });
  it('kartu jabatan kosong punya override gelap', () => {
    expect(blockOf(card, '.card[data-vacant]')).toContain('@mixin dark');
  });
  it('garis bagan diredam di gelap', () => {
    expect(decl(blockOf(PUB('_com/struktur-organisasi/struktur-chart.module.css'), '.chart'), '--line')).toBe(
      'light-dark(#8ba8c1, #4f7194)',
    );
  });
  it('profil pegawai tanpa c="dark" / bg="white" inline (keduanya tak terbaca di gelap)', () => {
    const view = PUB('_com/struktur-organisasi/StrukturDetailView.tsx');
    expect(view).not.toMatch(/c="dark"|bg="white"|#eaeaea/);
    expect(blockOf(PUB('_com/struktur-organisasi/struktur-detail.module.css'), '.label')).toContain('@mixin dark');
  });
});

describe('halaman putih penuh: 404, Peta Informasi, logo program', () => {
  it.each([
    ['_com/not-found/not-found.module.css', '.section'],
    ['(tambahan)/peta-informasi/_com/peta-informasi.module.css', '.page'],
  ])('%s: alias token + latar --c-bg', (file, sel) => {
    const b = blockOf(PUB(file), sel);
    expect(decl(b, '--ink')).toBe('var(--c-ink)');
    expect(decl(b, '--brand')).toBe('var(--c-brand)');
    expect(decl(b, 'background')).toBe('var(--c-bg)');
  });
  it('ubin ber-logo gelap = ubin gelap halaman; kotak logo tanpa pelat di kedua tema (pilihan user 2026-11-24)', () => {
    const css = stripComments(PUB('_com/program-tiles/program-tiles.module.css'));
    const logo = blockOf(css, '.logo');
    expect(logo).not.toMatch(/background/);
    expect(logo).not.toMatch(/@mixin dark/);
    expect(css).not.toMatch(/\.tileLogo \{\s*@mixin dark/);
    expect(css).not.toContain('#d9e1ea');
  });
});

describe('Tooltip Mantine situs publik di gelap', () => {
  it('theme-tokens.css menimpa tooltip terang bawaan Mantine hanya di gelap', () => {
    const rule = blockOf(TOKENS, ':root[data-mantine-color-scheme="dark"] .mantine-Tooltip-tooltip');
    expect(decl(rule, '--tooltip-bg')).toBe('var(--c-tile-alt)');
    expect(decl(rule, '--tooltip-color')).toBe('var(--c-ink)');
  });
});

describe('render: komponen ber-prop warna Mantine memakai token', () => {
  it('GaleriFoto: judul section berwarna --c-brand', () => {
    const foto: FotoGaleriItem[] = [
      { id: 'f1', imageId: 'i1', keterangan: 'Gotong royong', urutan: 1, image: { id: 'i1', link: '/x.jpg' } }, // test-only
    ];
    const html = renderToStaticMarkup(
      <MantineProvider>
        <GaleriFoto
          foto={foto}
          namaPemilik="Posyandu"
          ariaLabel="Galeri foto Posyandu"
        />
      </MantineProvider>,
    );
    expect(html).toContain('var(--c-brand)');
    expect(html).not.toMatch(/#0A4E78/i);
  });
});
