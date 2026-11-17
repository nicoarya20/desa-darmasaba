// @vitest-environment node
// Tema gelap Fase 1 (sesi 3, lanjutan): /desa-anti-korupsi ikut token lewat `.section`, sedangkan halaman
// PPID IKM tetap berlatar terang dan mengunci token grafik ke nilai terang di `.surface`.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as kepuasanMeta from '@/app/(public)/_com/main-page/kepuasan/kepuasan.meta';

const SRC = (rel: string) => readFileSync(path.resolve(__dirname, '../../src', rel), 'utf8');

/** Nilai deklarasi `--nama: nilai;` pertama di dalam blok CSS. */
const decl = (block: string, name: string) => block.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim();

/** Isi blok selektor pertama yang persis `sel {`. */
const blockOf = (css: string, sel: string) => {
  const start = css.indexOf(`${sel} {`);
  return start < 0 ? '' : css.slice(start, css.indexOf('\n}', start));
};

describe('/desa-anti-korupsi mengikuti token tema', () => {
  it('halaman utama tidak lagi menimpa --brand lewat style inline', () => {
    const page = SRC('app/(public)/(tambahan)/desa-anti-korupsi/page.tsx');
    expect(page).not.toContain('ANTIKORUPSI_BRAND_VARS');
    expect(page).not.toMatch(/style=\{/);
  });

  it('.section mengambil --brand dari token --c-brand', () => {
    const section = blockOf(SRC('app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.module.css'), '.section');
    expect(decl(section, '--brand')).toBe('var(--c-brand)');
    expect(decl(section, '--brand-hover')).toBe('var(--c-brand-hover)');
  });
});

describe('/ppid/indeks-kepuasan-masyarakat', () => {
  it('KEPUASAN_BRAND_VARS sudah dihapus dan halaman tidak memasang style tambahan', () => {
    expect('KEPUASAN_BRAND_VARS' in kepuasanMeta).toBe(false);
    const page = SRC('app/(public)/(pages)/ppid/indeks-kepuasan-masyarakat/page.tsx');
    expect(page).not.toContain('KEPUASAN_BRAND_VARS');
    expect(page).not.toMatch(/style=\{/);
  });

  it('.surface mengunci token grafik ke nilai terang theme-tokens.css (kartu tetap putih di tema gelap)', () => {
    const lightRoot = blockOf(SRC('app/theme-tokens.css'), ':root');
    const surface = blockOf(SRC('app/(public)/(pages)/ppid/indeks-kepuasan-masyarakat/_com/ikm.module.css'), '.surface');
    for (const token of ['--c-tile', '--c-chart-1', '--c-chart-2', '--c-chart-3']) {
      expect(decl(lightRoot, token)).toBeDefined();
      expect(decl(surface, token)).toBe(decl(lightRoot, token));
    }
    expect(decl(surface, '--chart-text-color')).toBe('var(--mantine-color-gray-6)');
  });
});
