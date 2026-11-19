// @vitest-environment node
// Lanjutan perbaikan CLS grafik beranda (stg 0.1.312, gulir cepat + cache dingin: CLS 0,5-0,8):
//  (1) kelas tinggi cadangan MountWhenNear tidak boleh dilepas setelah isi terpasang (kotak runtuh lalu mengembang);
//  (2) kerangka pemuatan Kepuasan/APBDes harus setinggi isi akhirnya (kerangka lama 740px vs isi 852px+tombol, dst.).
// Tinggi ASLI diukur di stg 0.1.312 pada 2026-11-18 (jendela 1440/900/390px). jsdom rusak → renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ApbdesSkeleton } from '@/app/(public)/_com/main-page/apbdes/components/ApbdesSkeleton';
import { KepuasanSkeleton } from '@/app/(public)/_com/main-page/kepuasan/components/KepuasanSkeleton';

const ROOT = join(process.cwd(), 'src/app/(public)/_com');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

/** Tinggi numerik (px) ditulis Mantine sebagai `height:calc(<rem> * var(--mantine-scale))`. */
const h = (px: number) => `height:calc(${px / 16}rem * var(--mantine-scale))`;

type Tier = 'desktop' | 'tablet' | 'phone';
const TIERS: Tier[] = ['desktop', 'tablet', 'phone'];

/** Nilai deklarasi `prop` per rentang lebar: dasar, ≤1068px (menimpa dasar), ≤734px (menimpa keduanya). */
function byTier(css: string, prop: string): Record<Tier, number> {
  const at1068 = css.indexOf('@media (max-width: 1068px)');
  const at734 = css.indexOf('@media (max-width: 734px)');
  const grab = (block: string) => Number(block.match(new RegExp(`${prop}:\\s*(\\d+)px`))?.[1] ?? NaN);
  const base = grab(css.slice(0, at1068));
  const tablet = Number.isNaN(grab(css.slice(at1068, at734))) ? base : grab(css.slice(at1068, at734));
  const phone = Number.isNaN(grab(css.slice(at734))) ? tablet : grab(css.slice(at734));
  return { desktop: base, tablet, phone };
}

describe('MountWhenNear: kelas tinggi tidak dilepas', () => {
  const src = read('lazy-chart/MountWhenNear.tsx');

  it('className kotak selalu placeholderClassName (bukan bersyarat pada near)', () => {
    expect(src).toContain('className={placeholderClassName}');
    expect(src).not.toMatch(/near\s*\?\s*undefined\s*:\s*placeholderClassName/);
  });
});

describe('kerangka Kepuasan setinggi isi akhir', () => {
  const css = strip(read('main-page/kepuasan/components/kepuasan-skeleton.module.css'));
  // [tinggi asli panel bulanan, tinggi asli kartu donat] per rentang; toleransi 25px (variasi teks kartu).
  const REAL: Record<Tier, { monthly: number; card: number }> = {
    desktop: { monthly: 425.7, card: 405.8 },
    tablet: { monthly: 408.9, card: 397.8 },
    phone: { monthly: 467.1, card: 356.5 },
  };
  const monthly = byTier(css, '--sk-monthly');
  const card = byTier(css, '--sk-card');

  it.each(TIERS)('%s: panel bulanan dan kartu donat dalam toleransi tinggi terukur', (tier) => {
    expect(Math.abs(monthly[tier] - REAL[tier].monthly)).toBeLessThanOrEqual(25);
    expect(Math.abs(card[tier] - REAL[tier].card)).toBeLessThanOrEqual(25);
  });

  it('memakai kotak lazy.kepuasan (min-height total) + kerangka tombol ajakan setinggi tombol aslinya (50px)', () => {
    const html = render(<KepuasanSkeleton />);
    expect(html).toMatch(/class="[^"]*kepuasan[^"]*"[^>]*role="status"/);
    expect(html).toContain('var(--sk-monthly)');
    expect(html).toContain('var(--sk-card)');
    expect(html).toContain(h(50));
  });

  it('bukan tinggi tetap lama (400px bulanan / 320px kartu)', () => {
    const html = render(<KepuasanSkeleton />);
    expect(html).not.toContain(h(400));
    expect(html).not.toContain(h(320));
  });
});

describe('kerangka APBDes varian beranda setinggi isi akhir', () => {
  const css = strip(read('main-page/apbdes/components/apbdes-skeleton.module.css'));
  const REAL: Record<Tier, { content: number; summary: number }> = {
    desktop: { content: 988.3, summary: 249.4 },
    tablet: { content: 955.5, summary: 232.6 },
    phone: { content: 1369.6, summary: 220.6 },
  };
  const minHeight = byTier(css, 'min-height');
  const summary = byTier(css, '--sk-summary');

  it.each(TIERS)('%s: min-height isi dan tinggi kartu ringkasan dalam toleransi tinggi terukur', (tier) => {
    expect(Math.abs(minHeight[tier] - REAL[tier].content)).toBeLessThanOrEqual(3);
    expect(Math.abs(summary[tier] - REAL[tier].summary)).toBeLessThanOrEqual(3);
  });

  it('beranda (compact): ada kerangka keterangan tahun (57px) dan isi ber-min-height; tanpa 232px/360px lama', () => {
    const html = render(<ApbdesSkeleton variant="compact" />);
    expect(html).toContain(h(57));
    expect(html).toContain('var(--sk-summary)');
    expect(html).not.toContain(h(232));
    expect(html).not.toContain(h(360));
    expect(html).toMatch(/role="status"/);
  });

  it('halaman detail (full) tetap kerangka sederhana lama', () => {
    const html = render(<ApbdesSkeleton variant="full" />);
    expect(html).toContain(h(232));
    expect(html).toContain(h(360));
  });

  it('breakpoint sama dengan apbdes.module.css (1068px dan 734px)', () => {
    const src = read('main-page/apbdes/apbdes.module.css');
    expect(src).toContain('@media (max-width: 1068px)');
    expect(src).toContain('@media (max-width: 734px)');
  });
});
