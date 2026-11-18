// @vitest-environment node
// Juknis lomba 5.4: CLS hero 0,16 di PageSpeed mobile. Penyebab TERUKUR (stg 0.1.316, sinyal lambat + CPU 4x): deretan ikon
// media sosial (44px + margin 20px) tidak dirender selama datanya dimuat lalu muncul dan mendorong foto, kartu nama, dan
// rel program ±64px (pita hero 342→400px tepat saat mediasosial/findMany selesai); kerangka profil juga hanya setinggi
// foto sehingga tinggi hero bertambah ±42px saat kartu nama tiba. (Dugaan awal "pergantian font" TERBUKTI salah:
// font-display: optional tidak mengubah CLS.) jsdom rusak → renderToStaticMarkup; perilaku di browser baru terukur di stg.
import { MantineProvider } from '@mantine/core';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { HeroSosmedPlaceholder } from '@/app/(public)/_com/main-page/landing-page/HeroInfo';
import { HeroProfileSkeleton } from '@/app/(public)/_com/main-page/landing-page/HeroProfile';

const DIR = join(process.cwd(), 'src/app/(public)/_com/main-page/landing-page');
const css = readFileSync(join(DIR, 'landing.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const index = readFileSync(join(DIR, 'index.tsx'), 'utf8');
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

/** Isi blok CSS `selector { ... }` yang berdiri sendiri (di luar @media). */
function block(selector: string): string {
  const flat = css.replace(/@media[^{]*\{[\s\S]*?\}\s*\}/g, '');
  const m = flat.match(new RegExp(`(?:^|\\n)${selector.replace(/[.]/g, '\\.')}\\s*\\{([^}]*)\\}`));
  return m?.[1] ?? '';
}
const px = (decl: string, prop: string) => Number(decl.match(new RegExp(`${prop}:\\s*(-?\\d+(?:\\.\\d+)?)px`))?.[1] ?? NaN);

describe('ikon media sosial: ruang cadangan selama memuat', () => {
  it('HeroSosmedPlaceholder: kotak kosong tersembunyi (bukan daftar tautan)', () => {
    const html = render(<HeroSosmedPlaceholder />);
    expect(html).toMatch(/class="[^"]*sosmedPlaceholder[^"]*"/);
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('<ul');
    expect(html).not.toContain('<a ');
  });

  it('index.tsx merender placeholder saat loadingSosmed (bukan tidak merender apa pun)', () => {
    expect(index).toMatch(/loadingSosmed\s*\?\s*<HeroSosmedPlaceholder\s*\/>\s*:\s*<HeroSosmed/);
    expect(index).not.toMatch(/!loadingSosmed\s*&&/);
  });

  it('ukuran placeholder = ikon aslinya: tinggi 44px (.sosmedLink) dan margin atas 20px (.sosmed)', () => {
    const ph = block('.sosmedPlaceholder');
    expect(px(ph, 'height')).toBe(px(block('.sosmedLink'), 'height'));
    expect(px(ph, 'height')).toBe(44);
    expect(px(ph, 'margin')).toBe(px(block('.sosmed'), 'margin'));
  });
});

describe('kerangka profil Perbekel: ikut kartu nama', () => {
  it('HeroProfileSkeleton memuat kerangka foto DAN kerangka kartu nama', () => {
    const html = render(<HeroProfileSkeleton />);
    expect(html).toMatch(/photoSkeleton/);
    expect(html).toMatch(/nameCardSkeleton/);
    expect(html).toContain('aria-hidden="true"');
  });

  it('margin atas kerangka sama dengan kartu nama asli (-32px) dan radius 18px', () => {
    const sk = block('.nameCardSkeleton');
    const real = block('.nameCard');
    expect(px(sk, 'margin-top')).toBe(px(real, 'margin-top'));
    expect(px(sk, 'margin-top')).toBe(-32);
    expect(px(sk, 'border-radius')).toBe(px(real, 'border-radius'));
  });

  it('tinggi kerangka dalam toleransi tinggi terukur: desktop ≥1069px 84px; tablet/ponsel ±74px (71-74)', () => {
    expect(Math.abs(px(block('.nameCardSkeleton'), 'height') - 74)).toBeLessThanOrEqual(3);
    const desktop = css.match(/@media \(min-width: 1069px\)\s*\{\s*\.nameCardSkeleton\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(Math.abs(px(desktop, 'height') - 84)).toBeLessThanOrEqual(3);
  });
});
