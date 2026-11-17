// @vitest-environment node
// Dark theme Fase 1, beranda bagian atas (hero + pita, overlay Program Inovasi, Kabar Desa, APBDes, Prestasi):
// 1. pita hero: tiap stripe punya pasangan --ribbon-n terang/gelap; terang = warna lama, emas & merah sama di dua tema,
// 2. warna brand tidak lagi disuntik inline (*_BRAND_VARS) di section beranda; variabel yang masih diekspor = token,
// 3. aksen kategori & grafik APBDes ikut tema dengan nilai terang = nilai lama, tombol isi pakai --c-brand-fill.
// Rencana: MIND/PLAN/plan-dark-theme.md ("Kontrak token", "Fase 1").
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { APBDES_BRAND_VARS, TIPE_META } from '@/app/(public)/_com/main-page/apbdes/apbdes.meta';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import { buildRibbonPaths, RIBBON_STRIPES } from '@/app/(public)/_com/main-page/landing-page/ribbons.logic';

const MAIN = 'app/(public)/_com/main-page';
const SRC = (rel: string) => readFileSync(path.resolve(__dirname, '../../src', rel), 'utf8');
/** Isi CSS tanpa komentar (komentar boleh menyebut nama variabel/kelas). */
const CSS = (rel: string) => SRC(rel).replace(/\/\*[\s\S]*?\*\//g, '');

/** Isi blok `selector { … }` pertama (tanpa blok bersarang). */
function block(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`(?:^|[\\s}])${escaped}\\s*\\{([^{}]*)\\}`));
  if (!match) throw new Error(`Blok ${selector} tidak ditemukan`);
  return match[1];
}

/** Nilai `light-dark(terang, gelap)` sebuah variabel di CSS (postcss-preset-mantine). */
function lightDark(css: string, name: string): { light: string; dark: string } {
  const match = css.match(new RegExp(`${name}:\\s*light-dark\\(\\s*([^,]+?)\\s*,\\s*([^;]+?)\\s*\\);`));
  if (!match) throw new Error(`${name} bukan light-dark(…)`);
  return { light: match[1].toLowerCase(), dark: match[2].toLowerCase() };
}

describe('pita hero terang/gelap', () => {
  const css = CSS(`${MAIN}/landing-page/landing.module.css`);

  // test-only: warna seragam Perbekel sebelum dark theme (dalam → luar) = nilai terang yang wajib dipertahankan.
  const LIGHT = [
    '#062f49', '#0b3d5e', '#0a4e78', '#2f6f99', '#d4a72c', '#5f8db3',
    '#7fa6c6', '#a9c3da', '#ffffff', '#c8102e', '#bccbe0',
  ];
  // test-only: pita gelap varian B "Biru tegas" (dipilih user 2026-11-17): pita pucat luar diturunkan ke biru baja.
  const DARK = [
    '#0d3a5a', '#124a72', '#1a5f8f', '#2f78a8', '#d4a72c', '#3f6b92',
    '#4f7194', '#3d5a78', '#d9e1ea', '#c8102e', '#2b4560',
  ];
  const GOLD = 4;
  const RED = 9;

  it('setiap stripe punya pasangan --ribbon-n terang/gelap, tanpa variabel berlebih', () => {
    expect(RIBBON_STRIPES).toHaveLength(LIGHT.length);
    RIBBON_STRIPES.forEach((_, i) => {
      expect(lightDark(css, `--ribbon-${i + 1}`)).toEqual({ light: LIGHT[i], dark: DARK[i] });
    });
    expect(css).not.toContain(`--ribbon-${RIBBON_STRIPES.length + 1}:`);
  });

  it('emas dan merah sama di kedua tema', () => {
    for (const i of [GOLD, RED]) {
      const { light, dark } = lightDark(css, `--ribbon-${i + 1}`);
      expect(dark).toBe(light);
    }
  });

  it('path pita diisi variabel CSS (bukan hex dari JS), urutan sama dengan stripe', () => {
    const fills = buildRibbonPaths().map((p) => p.fill);
    expect(fills).toEqual(RIBBON_STRIPES.map((_, i) => `var(--ribbon-${i + 1})`));
    expect(fills.join(' ')).not.toMatch(/#[0-9a-f]{3,6}/i);
  });

  it('latar hero dari token --c-hero-bg', () => {
    expect(block(css, '.section')).toContain('background: var(--c-hero-bg);');
  });
});

describe('warna brand tidak lagi inline di beranda', () => {
  const FILES = [
    `${MAIN}/kabar-desa/index.tsx`,
    `${MAIN}/apbdes/index.tsx`,
    `${MAIN}/prestasi/index.tsx`,
    `${MAIN}/prestasi/PrestasiListPage.tsx`,
    `${MAIN}/apbdes/components/ApbdesChart.tsx`,
    `${MAIN}/landing-page/program-overlay/ProgramInovasiOverlay.tsx`,
  ];

  it.each(FILES)('%s tanpa *_BRAND_VARS dan tanpa colors.ts', (file) => {
    const src = SRC(file);
    expect(src).not.toMatch(/BRAND_VARS/);
    expect(src).not.toContain('@/con/colors');
  });

  it('variabel brand yang masih diekspor (dipakai menu lain) bernilai token, bukan hex', () => {
    expect(KABAR_BRAND_VARS).toEqual({ '--brand': 'var(--c-brand)' });
    expect(APBDES_BRAND_VARS).toEqual({ '--brand': 'var(--c-brand)', '--brand-hover': 'var(--c-brand-hover)' });
  });

  it('section beranda mengalias --brand ke token --c-brand', () => {
    expect(block(CSS(`${MAIN}/kabar-desa/kabar.module.css`), '.section')).toContain('--brand: var(--c-brand);');
    expect(block(CSS(`${MAIN}/apbdes/apbdes.module.css`), '.section')).toContain('--brand: var(--c-brand);');
    expect(block(CSS(`${MAIN}/prestasi/prestasi.module.css`), '.section')).toContain('--brand: var(--c-brand);');
    expect(block(CSS(`${MAIN}/landing-page/program-overlay/program-overlay.module.css`), '.content')).toContain(
      '--brand: var(--c-brand);',
    );
  });
});

describe('tombol isi memakai --c-brand-fill + --c-on-brand (bukan --brand teks)', () => {
  const CASES: [string, string][] = [
    [`${MAIN}/apbdes/apbdes.module.css`, '.ctaLink'],
    [`${MAIN}/apbdes/apbdes.document.module.css`, '.download'],
    [`${MAIN}/prestasi/prestasi.module.css`, '.cta'],
  ];

  it.each(CASES)('%s %s', (file, selector) => {
    const body = block(CSS(file), selector);
    expect(body).toContain('background: var(--c-brand-fill);');
    expect(body).toContain('color: var(--c-on-brand);');
    expect(CSS(file)).toContain(`${selector}:hover {\n    background: var(--c-brand-fill-hover);`);
  });
});

describe('APBDes: aksen kategori & grafik ikut tema', () => {
  const css = CSS(`${MAIN}/apbdes/apbdes.module.css`);

  // test-only: nilai terang lama TIPE_META (sebelum dark theme) yang wajib dipertahankan.
  const LIGHT: Record<string, { accent: string; tint: string }> = {
    pendapatan: { accent: 'var(--mantine-color-teal-7)', tint: 'var(--mantine-color-teal-0)' },
    belanja: { accent: 'var(--c-brand)', tint: 'var(--c-brand-tint)' },
    pembiayaan: { accent: 'var(--mantine-color-orange-7)', tint: 'var(--mantine-color-orange-0)' },
  };

  /** Nilai terang variabel: argumen pertama light-dark(), atau nilai polos bila tidak beda per tema. */
  const lightValue = (name: string) => {
    const plain = css.match(new RegExp(`${name}:\\s*([^;]+);`));
    if (!plain) throw new Error(`${name} tidak dideklarasikan`);
    return plain[1].startsWith('light-dark(') ? lightDark(css, name).light : plain[1].trim();
  };

  it.each(Object.keys(LIGHT))('%s: accent/tint = var(--apbdes-*) dengan nilai terang lama', (tipe) => {
    const meta = TIPE_META[tipe as keyof typeof TIPE_META];
    expect(meta.accent).toBe(`var(--apbdes-${tipe}-accent)`);
    expect(meta.tint).toBe(`var(--apbdes-${tipe}-tint)`);
    expect(lightValue(`--apbdes-${tipe}-accent`)).toBe(LIGHT[tipe].accent);
    expect(lightValue(`--apbdes-${tipe}-tint`)).toBe(LIGHT[tipe].tint);
  });

  it('variabel aksen dipasang juga di .card dan .panel (dipakai halaman lain tanpa .section)', () => {
    expect(css).toMatch(/\.section,\s*\.card,\s*\.panel\s*\{\s*--apbdes-pendapatan-accent/);
  });

  it('grafik pagu/realisasi: terang tetap chart-3 (pagu) dan chart-1 (realisasi); gelap pagu biru redup', () => {
    // Gelap: pagu #4a7598 (audit 2026-11-18) — ≥3:1 di ubin #1d1d1f dan ≥2:1 terhadap realisasi #6cb4e4,
    // lebih redup dari realisasi seperti urutan di terang (chart-2 #2f91cc cuma 1,5:1 terhadap realisasi).
    expect(lightDark(css, '--apbdes-chart-pagu')).toEqual({ light: 'var(--c-chart-3)', dark: '#4a7598' });
    expect(css).toContain('--apbdes-chart-realisasi: var(--c-chart-1);');
    const chart = SRC(`${MAIN}/apbdes/components/ApbdesChart.tsx`);
    expect(chart).toContain('color: "var(--apbdes-chart-pagu)"');
    expect(chart).toContain('color: "var(--apbdes-chart-realisasi)"');
  });
});
