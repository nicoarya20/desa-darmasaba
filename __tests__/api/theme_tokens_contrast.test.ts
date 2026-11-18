// @vitest-environment node
// Kontrak token warna situs publik (src/app/theme-tokens.css, docs/DESIGN.md §2.5):
// 1. nilai terang = nilai literal lama (tema terang wajib identik piksel),
// 2. terang & gelap mendefinisikan token yang sama,
// 3. kontras WCAG pasangan teks/latar ≥ 4,5 dan grafik ≥ 3 (gelap penuh; terang dengan pengecualian eksplisit).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DARK_ERROR_COLOR } from '@/app/_com/site-css-variables-resolver';

const CSS_PATH = path.resolve(__dirname, '../../src/app/theme-tokens.css');
const DARK_SELECTOR = ':root[data-mantine-color-scheme="dark"]';

type Tokens = Record<string, string>;

/** Ambil `--c-*` per blok selektor (komentar dibuang dulu: komentar boleh berisi `{ }`). */
function parseTokenBlocks(css: string): Map<string, Tokens> {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = new Map<string, Tokens>();
  for (const [, selector, body] of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const tokens: Tokens = {};
    for (const [, name, value] of body.matchAll(/--(c-[\w-]+)\s*:\s*([^;]+);/g)) tokens[name] = value.trim();
    blocks.set(selector.trim(), tokens);
  }
  return blocks;
}

/** Luminans relatif WCAG 2.x dari hex #rgb/#rrggbb. */
function luminance(hex: string): number {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? [...raw].map((c) => c + c).join('') : raw;
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`Bukan warna hex: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(full.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const blocks = parseTokenBlocks(readFileSync(CSS_PATH, 'utf8'));
const light = blocks.get(':root') ?? {};
const dark = blocks.get(DARK_SELECTOR) ?? {};

const TEXT = ['c-ink', 'c-ink-2', 'c-muted', 'c-subtle', 'c-brand'];
const SURFACES = ['c-bg', 'c-bg-alt', 'c-tile', 'c-tile-alt', 'c-page'];
const CHART = ['c-chart-1', 'c-chart-2', 'c-chart-3'];
const CHART_SURFACES = ['c-bg', 'c-bg-alt', 'c-tile', 'c-tile-alt'];

/** Pasangan di tema TERANG yang di bawah ambang: nilai lama yang tidak boleh diubah (identik piksel). */
const LIGHT_EXCEPTIONS = new Set([
  ...SURFACES.map((bg) => `c-subtle@${bg}`), // #86868b: teks ketiga (keterangan kecil), sudah dipakai sejak lama
  ...CHART_SURFACES.map((bg) => `c-chart-3@${bg}`), // #8ac1e3: tint seri ketiga, dekoratif
]);

/** Nilai terang = literal yang dipakai situs sebelum dark theme (kontrak; ubah = perubahan visual). */
const LEGACY_LIGHT: Tokens = {
  'c-page': '#f4f5f6',
  'c-bg': '#fff',
  'c-bg-alt': '#f5f5f7',
  'c-tile': '#f5f5f7',
  'c-tile-alt': '#fff',
  'c-ink': '#1d1d1f',
  'c-ink-2': '#515154',
  'c-muted': '#6e6e73',
  'c-subtle': '#86868b',
  'c-line': 'rgba(0, 0, 0, 0.08)',
  'c-line-strong': '#d2d2d7',
  'c-placeholder': '#e8e8ed',
  'c-brand': '#0a4e78',
  'c-brand-hover': '#083f61',
  'c-brand-fill': '#0a4e78',
  'c-brand-fill-hover': '#083f61',
  'c-on-brand': '#fff',
  'c-brand-tint': '#e5f2fa',
  'c-hero-bg': '#d1d9e8',
  'c-footer-from': '#1c6ea4',
  'c-footer-to': '#124170',
  'c-chart-1': '#0a4e78',
  'c-chart-2': '#2f91cc',
  'c-chart-3': '#8ac1e3',
  'c-open': '#1f9d55',
  'c-closed': '#d9363e',
  'c-focus': '#0071e3',
};

function failingPairs(tokens: Tokens, exceptions: Set<string>) {
  const fails: string[] = [];
  const check = (fg: string, bg: string, min: number) => {
    if (exceptions.has(`${fg}@${bg}`)) return;
    const ratio = contrast(tokens[fg], tokens[bg]);
    if (ratio < min) fails.push(`${fg} di ${bg}: ${ratio.toFixed(2)} < ${min}`);
  };
  for (const fg of TEXT) for (const bg of SURFACES) check(fg, bg, 4.5);
  check('c-on-brand', 'c-brand-fill', 4.5);
  check('c-on-brand', 'c-brand-fill-hover', 4.5);
  check('c-brand', 'c-brand-tint', 4.5);
  for (const fg of CHART) for (const bg of CHART_SURFACES) check(fg, bg, 3);
  for (const bg of SURFACES) check('c-focus', bg, 3); // WCAG 1.4.11: cincin fokus ≥ 3 di semua latar
  return fails;
}

describe('theme-tokens.css: struktur', () => {
  it('punya blok terang (:root) dan gelap (data-mantine-color-scheme="dark")', () => {
    expect(Object.keys(light).length).toBeGreaterThan(0);
    expect(Object.keys(dark).length).toBeGreaterThan(0);
  });

  it('terang dan gelap mendefinisikan token yang sama', () => {
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
  });

  it('nilai terang sama dengan literal lama (tema terang identik piksel)', () => {
    expect(light).toEqual(LEGACY_LIGHT);
  });
});

describe('theme-tokens.css: kontras WCAG', () => {
  it('tema gelap: semua pasangan teks ≥ 4,5, putih di tombol ≥ 4,5, grafik ≥ 3', () => {
    expect(failingPairs(dark, new Set())).toEqual([]);
  });

  it('tema terang: lulus kecuali pengecualian nilai lama yang tercatat', () => {
    expect(failingPairs(light, LIGHT_EXCEPTIONS)).toEqual([]);
  });

  it('pengecualian terang masih benar-benar di bawah ambang (hapus butir bila sudah lulus)', () => {
    for (const pair of LIGHT_EXCEPTIONS) {
      const [fg, bg] = pair.split('@');
      const min = fg.startsWith('c-chart') ? 3 : 4.5;
      expect(contrast(light[fg], light[bg]), pair).toBeLessThan(min);
    }
  });

  it('tema gelap: merah galat Mantine (resolver) ≥ 4,5 di semua latar gelap', () => {
    for (const bg of SURFACES) {
      expect(contrast(DARK_ERROR_COLOR, dark[bg]), `galat di ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('perhitungan kontras sesuai acuan WCAG (hitam/putih = 21, warna sama = 1)', () => {
    expect(contrast('#000', '#fff')).toBeCloseTo(21, 5);
    expect(contrast('#6cb4e4', '#6cb4e4')).toBeCloseTo(1, 5);
    expect(contrast('#6cb4e4', '#000')).toBeCloseTo(9.29, 2);
  });
});
