// @vitest-environment node
// Tema gelap menu Kesehatan (Fase 3): halaman gaya lama (Mantine di atas latar biru) membaca variabel `.tema`
// kesehatan-tema.module.css; halaman gaya baru mewarisi alias token dari kerangka bersama tanpa style inline.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import type { CSSProperties } from 'react';
import { describe, expect, it } from 'vitest';
import * as posyanduMeta from '@/app/(public)/(pages)/kesehatan/posyandu/_com/posyandu.meta';

const ROOT = path.resolve(__dirname, '../../src/app/(public)/(pages)/kesehatan');
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');
/** Nilai properti kustom (`--x`) dari objek style inline (CSSProperties tak berindeks string, jadi lewat entries). */
const cssVar = (style: CSSProperties, name: `--${string}`): unknown => Object.fromEntries(Object.entries(style))[name];

/** Semua file di bawah folder Kesehatan dengan ekstensi tertentu (path relatif). */
function filesUnder(dir: string, exts: string[]): string[] {
  return readdirSync(path.join(ROOT, dir)).flatMap((name) => {
    const rel = path.join(dir, name);
    if (statSync(path.join(ROOT, rel)).isDirectory()) return filesUnder(rel, exts);
    return exts.some((e) => name.endsWith(e)) ? [rel] : [];
  });
}

/** Nilai deklarasi `--nama: nilai;` pertama di dalam blok CSS. */
const decl = (block: string, name: string) => block.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim();

/** Isi blok selektor pertama yang persis `sel {`. */
const blockOf = (css: string, sel: string) => {
  const start = css.indexOf(`${sel} {`);
  return start < 0 ? '' : css.slice(start, css.indexOf('\n}', start));
};

const CODE = filesUnder('.', ['.tsx', '.ts']);

describe('Kesehatan: tanpa warna literal tema terang di kode komponen', () => {
  it('tidak ada impor @/con/colors, *_BRAND_VARS, atau c="dark"', () => {
    for (const rel of CODE) {
      const src = read(rel);
      expect(src, rel).not.toContain('@/con/colors');
      expect(src, rel).not.toMatch(/_BRAND_VARS/);
      expect(src, rel).not.toContain('c="dark"');
    }
  });

  it('setiap wadah dangerouslySetInnerHTML memakai penetral rich text rt.root', () => {
    for (const rel of CODE) {
      const src = read(rel);
      const tags = src.split('<').filter((tag) => tag.includes('dangerouslySetInnerHTML'));
      for (const tag of tags) expect(tag, rel).toContain('rt.root');
      if (tags.length > 0) expect(src, rel).toContain("@/app/(public)/_com/rich-text/rich-text.module.css");
    }
  });
});

describe('kesehatan-tema.module.css (halaman gaya lama)', () => {
  const tema = blockOf(read('_com/kesehatan-tema.module.css'), '.tema');

  it('nilai terang = nilai src/con/colors.ts lama (identik piksel), gelap = token', () => {
    expect(decl(tema, '--kt-glass')).toBe('light-dark(rgb(255 255 255 / 50%), rgb(255 255 255 / 6%))');
    expect(decl(tema, '--kt-panel')).toBe('light-dark(#fbfbfc, var(--c-tile))');
    expect(decl(tema, '--kt-info')).toBe('light-dark(#628ec6, var(--c-brand-fill))');
    expect(decl(tema, '--kt-card-from')).toBe('light-dark(#fdfdfd, var(--c-tile))');
    expect(decl(tema, '--kt-card-to')).toBe('light-dark(#f7faff, var(--c-tile))');
    expect(decl(tema, '--kt-ink-dark')).toBe('light-dark(var(--mantine-color-dark-text), var(--c-ink))');
  });

  it('akar tiap halaman/komponen gaya lama memasang .tema', () => {
    for (const rel of [
      'data-kesehatan-warga/page.tsx',
      'data-kesehatan-warga/artikel-kesehatan-page/page.tsx',
      'data-kesehatan-warga/artikel-kesehatan-page/[id]/page.tsx',
      'data-kesehatan-warga/fasilitas-kesehatan-page/page.tsx',
      'data-kesehatan-warga/fasilitas-kesehatan-page/[id]/page.tsx',
      'data-kesehatan-warga/jadwal-kegiatan-page/page.tsx',
      'data-kesehatan-warga/jadwal-kegiatan-page/[id]/page.tsx',
      'data-kesehatan-warga/grafik-penyakit/page.tsx',
      'info-wabah-penyakit/page.tsx',
      'info-wabah-penyakit/[id]/page.tsx',
      'penanganan-darurat/page.tsx',
      'penanganan-darurat/[id]/page.tsx',
    ]) {
      expect(read(rel), rel).toContain('className={t.tema}');
    }
  });

  it('latar halaman = --c-hero-bg dan judul/ikon brand = --c-brand', () => {
    const page = read('penanganan-darurat/page.tsx');
    expect(page).toContain('bg="var(--c-hero-bg)"');
    expect(page).toContain('"var(--c-brand)"');
  });
});

describe('halaman gaya baru (Posyandu, Pustu)', () => {
  it('ACCENT posyandu memakai palet kategori APBDes yang light-dark, bukan literal', () => {
    expect('POSYANDU_BRAND_VARS' in posyanduMeta).toBe(false);
    const { ACCENT } = posyanduMeta;
    expect(cssVar(ACCENT.brand, '--accent')).toBe('var(--apbdes-belanja-accent)');
    expect(cssVar(ACCENT.teal, '--tint')).toBe('var(--apbdes-pendapatan-tint)');
    expect(cssVar(ACCENT.orange, '--accent')).toBe('var(--apbdes-pembiayaan-accent)');
  });

  it('pil putih di atas ubin naik ke --c-tile-alt; tombol isi pakai --c-brand-fill + --c-on-brand', () => {
    const rows = read('posyandu/_com/posyandu-rows.module.css');
    expect(decl(blockOf(rows, '.call'), 'background')).toBe('var(--c-tile-alt)');
    expect(decl(blockOf(rows, '.thumb'), 'background')).toBe('var(--c-placeholder)');
    const detail = blockOf(read('posyandu/_com/detail/posyandu-detail.module.css'), '.call');
    expect(decl(detail, 'background')).toBe('var(--c-brand-fill)');
    expect(decl(detail, 'color')).toBe('var(--c-on-brand)');
  });

  it('ubin darurat Pustu: terang tetap #fde8ea/#d70015, gelap merah redup', () => {
    const css = read('puskesmas/_com/pustu.module.css');
    expect(decl(blockOf(css, '.tileDarurat'), 'background')).toBe('light-dark(#fde8ea, rgb(255 69 58 / 16%))');
    expect(decl(blockOf(css, '.tileDarurat .tileIcon'), 'color')).toBe('light-dark(#d70015, #ff6961)');
  });

  it('tidak ada warna hex literal di CSS Kesehatan di luar light-dark()', () => {
    for (const rel of filesUnder('.', ['.css'])) {
      const lines = read(rel)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .filter((line) => /#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(line) && !line.includes('light-dark('))
        // Teks di atas isi biru: putih kebiruan yang sama di dua tema (isi biru gelap tetap gelap).
        .filter((line) => !line.includes('--kt-on-fill:'));
      expect(lines, rel).toEqual([]);
    }
  });
});
