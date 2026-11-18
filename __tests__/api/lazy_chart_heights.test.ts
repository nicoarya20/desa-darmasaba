// @vitest-environment node
// Tinggi cadangan kotak grafik beranda harus sama dengan tinggi grafik aslinya; selisih membuat konten di bawahnya
// melompat saat grafik terpasang (CLS 0,294 pada kunjungan pertama dengan cache dingin, stg 0.1.310: tinggi cadangan
// Kepuasan 640px padahal asli 851px desktop / 1573px ponsel). Tinggi ASLI di bawah diukur di stg 0.1.310 pada
// 2026-11-18 (grafik terpasang, jendela 1440/900/390px); perbarui bersama lazy-chart.module.css bila isi panel berubah.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(process.cwd(), 'src/app/(public)/_com');
const css = readFileSync(join(ROOT, 'lazy-chart/lazy-chart.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

type Tier = 'desktop' | 'tablet' | 'phone';

/** Tinggi terukur (px) dan toleransi per rentang lebar. Kepuasan tablet bervariasi 827–920 menurut teks kartu donat. */
const MEASURED: Record<Tier, { apbdes: [number, number]; kepuasan: [number, number] }> = {
  desktop: { apbdes: [417.8, 3], kepuasan: [851.5, 3] },
  tablet: { apbdes: [409.8, 3], kepuasan: [850, 70] },
  phone: { apbdes: [398.3, 3], kepuasan: [1572.8, 25] },
};

/** Memecah CSS menjadi blok dasar, ≤1068px, dan ≤734px (nilai min-height per selektor). */
function minHeights(): Record<Tier, Record<'apbdes' | 'kepuasan', number>> {
  const grab = (block: string) => {
    const out: Partial<Record<'apbdes' | 'kepuasan', number>> = {};
    for (const m of block.matchAll(/\.(apbdes|kepuasan)\s*\{\s*min-height:\s*(\d+)px/g)) out[m[1] as 'apbdes' | 'kepuasan'] = Number(m[2]);
    return out;
  };
  const at1068 = css.indexOf('@media (max-width: 1068px)');
  const at734 = css.indexOf('@media (max-width: 734px)');
  const base = grab(css.slice(0, at1068));
  const tablet = { ...base, ...grab(css.slice(at1068, at734)) };
  const phone = { ...tablet, ...grab(css.slice(at734)) };
  return { desktop: base, tablet, phone } as never;
}

describe('lazy-chart.module.css: tinggi cadangan = tinggi grafik asli', () => {
  const heights = minHeights();

  it.each(['desktop', 'tablet', 'phone'] as const)('%s: kedua kotak punya min-height', (tier) => {
    expect(heights[tier].apbdes).toBeGreaterThan(0);
    expect(heights[tier].kepuasan).toBeGreaterThan(0);
  });

  it.each(['desktop', 'tablet', 'phone'] as const)('%s: APBDes dalam toleransi tinggi terukur', (tier) => {
    const [real, tol] = MEASURED[tier].apbdes;
    expect(Math.abs(heights[tier].apbdes - real)).toBeLessThanOrEqual(tol);
  });

  it.each(['desktop', 'tablet', 'phone'] as const)('%s: Kepuasan dalam toleransi tinggi terukur', (tier) => {
    const [real, tol] = MEASURED[tier].kepuasan;
    expect(Math.abs(heights[tier].kepuasan - real)).toBeLessThanOrEqual(tol);
  });

  it('bukan lagi 640px untuk Kepuasan (penyebab lompatan ~930px di ponsel)', () => {
    expect(heights.phone.kepuasan).toBeGreaterThan(1400);
    expect(heights.desktop.kepuasan).toBeGreaterThan(800);
  });

  it('breakpoint sama dengan CSS section aslinya (1068px dan 734px)', () => {
    for (const file of ['apbdes/apbdes.module.css', 'kepuasan/kepuasan.module.css']) {
      const src = readFileSync(join(ROOT, 'main-page', file), 'utf8');
      expect(src).toContain('@media (max-width: 1068px)');
      expect(src).toContain('@media (max-width: 734px)');
    }
  });
});
