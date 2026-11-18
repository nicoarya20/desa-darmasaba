// @vitest-environment node
// Tema gelap: menu Lingkungan ikut token --c-* lewat `.section` kabar.module.css (Fase 2/3).
// Kontrak: terang = literal lama, tanpa KABAR_BRAND_VARS inline, HTML CMS dibungkus rt.root,
// peta Bank Sampah = pulau terang (tile OSM tetap terang sampai user memutuskan).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const LINGKUNGAN = 'app/(public)/(pages)/lingkungan/';
const SRC = (rel: string) => readFileSync(path.resolve(__dirname, '../../src', LINGKUNGAN, rel), 'utf8');
/** Buang komentar CSS supaya literal yang hanya disebut di komentar tidak terhitung. */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Nilai deklarasi `nama: nilai;` pertama di dalam blok CSS. */
const decl = (block: string, name: string) => block.match(new RegExp(`(?:^|[\\s;{])${name}:\\s*([^;]+);`))?.[1].trim();

/** Isi blok selektor pertama yang persis `sel {`. */
const blockOf = (css: string, sel: string) => {
  const start = css.indexOf(`${sel} {`);
  return start < 0 ? '' : css.slice(start, css.indexOf('\n}', start));
};

describe('halaman Lingkungan tidak lagi memasang KABAR_BRAND_VARS inline', () => {
  it.each([
    '_com/program-info/LingkunganProgramInfoPage.tsx',
    'program-penghijauan/_com/PenghijauanPage.tsx',
    'program-penghijauan/_com/detail/PenghijauanDetail.tsx',
    'gotong-royong/_com/GotongRoyongPage.tsx',
    'data-lingkungan-desa/_com/DataLingkunganPage.tsx',
    'pengelolaan-sampah-bank-sampah/_com/BankSampahPage.tsx',
  ])('%s', (rel) => {
    const src = SRC(rel);
    expect(src).not.toContain('KABAR_BRAND_VARS');
    expect(src).not.toContain('@/con/colors');
  });
});

describe('HTML CMS dibungkus penetral rich text (rt.root)', () => {
  it.each(['program-penghijauan/_com/detail/PenghijauanDetail.tsx', 'data-lingkungan-desa/_com/DataLingkunganRows.tsx'])(
    '%s',
    (rel) => {
      const src = SRC(rel);
      expect(src).toContain('rich-text/rich-text.module.css');
      expect(src).toMatch(/className=\{`\$\{(d\.content|s\.prose)\} \$\{rt\.root\}`\} dangerouslySetInnerHTML/);
    },
  );
});

describe('garis Lingkungan dari --c-line-strong (terang #d2d2d7 = nilai lama)', () => {
  it('Data Lingkungan: --rule', () => {
    const css = stripComments(SRC('data-lingkungan-desa/_com/data-lingkungan.module.css'));
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(decl(blockOf(css, '.rows'), '--rule')).toBe('var(--c-line-strong)');
  });

  it('Bank Sampah: rel alur --rail', () => {
    const css = stripComments(SRC('pengelolaan-sampah-bank-sampah/_com/bank-sampah.module.css'));
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(decl(blockOf(css, '.steps'), '--rail')).toBe('var(--c-line-strong)');
  });
});

describe('Lokasi Bank Sampah: daftar ikut tema, peta pulau terang', () => {
  const css = stripComments(SRC('pengelolaan-sampah-bank-sampah/_com/lokasi.module.css'));

  it('bingkai peta berlatar --placeholder (terang #e8e8ed), bukan literal', () => {
    expect(decl(blockOf(css, '.mapFrame'), 'background')).toBe('var(--placeholder)');
  });

  it('wadah Leaflet mengunci skema terang + warna terang token (penanda & popup di atas tile terang)', () => {
    const fill = blockOf(css, '.mapFill');
    expect(decl(fill, 'color-scheme')).toBe('light');
    expect(decl(fill, '--brand')).toBe('#0a4e78');
    expect(decl(fill, '--ink')).toBe('#1d1d1f');
    expect(decl(fill, '--muted')).toBe('#6e6e73');
  });

  it('sapuan .cta di popup dikunci ke nilai terang (light-dark diubah postcss, color-scheme tak berpengaruh)', () => {
    // Spesifisitas 0,3,0 harus mengalahkan `[data-mantine-color-scheme='dark'] .cta` (0,2,0) dari link-reveal.
    expect(decl(blockOf(css, '.popup .popupArah > [data-text]'), '--reveal-to')).toBe('#1c6ea4');
    const reveal = path.resolve(__dirname, '../../src/app/(public)/_com/link-reveal/link-reveal.module.css');
    expect(readFileSync(reveal, 'utf8')).toContain('--reveal-to: light-dark(#1c6ea4, var(--c-ink));');
  });

  it('hover baris: terang rgba hitam lama, gelap sorot putih tipis', () => {
    expect(css).toContain(
      '.row:not(.rowSelected):has(button.pick:hover) {\n    background: light-dark(rgba(0, 0, 0, 0.04), rgba(255, 255, 255, 0.06));',
    );
  });

  it('tile peta tetap OSM terang (keputusan user 2026-11-18, final)', () => {
    expect(SRC('pengelolaan-sampah-bank-sampah/_com/LokasiMap.tsx')).toContain(
      'url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"',
    );
  });
});
