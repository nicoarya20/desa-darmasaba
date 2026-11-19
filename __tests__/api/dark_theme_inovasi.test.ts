// @vitest-environment node
// Tema gelap: menu Inovasi + halaman (tambahan) APBDes/Prestasi/SDGs ikut token --c-* (Fase 2/3).
// Kontrak: terang = literal lama (alias light-dark bernilai sama), pelat logo pihak ketiga #d9e1ea di gelap,
// HTML CMS dibungkus penetral rich text (rt.root), tanpa *_BRAND_VARS inline.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = (rel: string) => readFileSync(path.resolve(__dirname, '../../src', rel), 'utf8');
/** Buang komentar CSS supaya literal yang hanya disebut di komentar tidak terhitung. */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const INOVASI = 'app/(public)/(pages)/inovasi/';

/** Nilai deklarasi `nama: nilai;` pertama di dalam blok CSS. */
const decl = (block: string, name: string) => block.match(new RegExp(`(?:^|[\\s;{])${name}:\\s*([^;]+);`))?.[1].trim();

/** Isi blok selektor pertama yang persis `sel {`. */
const blockOf = (css: string, sel: string) => {
  const start = css.indexOf(`${sel} {`);
  return start < 0 ? '' : css.slice(start, css.indexOf('\n}', start));
};

describe('menu Inovasi tidak lagi memasang KABAR_BRAND_VARS inline', () => {
  const FILES = [
    'program-kreatif-desa/_com/ProgramKreatifPage.tsx',
    'program-kreatif-desa/_com/detail/ProgramKreatifDetail.tsx',
    'ajukan-ide-inovatif/_com/AjukanIdePage.tsx',
    'kolaborasi-inovasi/_com/KolaborasiPage.tsx',
    'inovasi-teknologi-desa/_com/InovasiTeknologiPage.tsx',
    'inovasi-teknologi-desa/_com/detail/InovasiDetail.tsx',
    'layanan-online-desa/_com/LayananOnlinePage.tsx',
    'layanan-online-desa/_com/administrasi/AdministrasiPage.tsx',
    'layanan-online-desa/_com/informasi/InformasiRedirect.tsx',
    'program-inovasi/_com/ProgramInovasiPage.tsx',
    'program-inovasi/_com/detail/ProgramInovasiDetail.tsx',
  ];

  it.each(FILES)('%s', (rel) => {
    expect(SRC(INOVASI + rel)).not.toContain('KABAR_BRAND_VARS');
  });
});

describe('tombol kirim formulir Inovasi memakai token isian brand', () => {
  it.each(['ajukan-ide-inovatif/_com/IdeFormView.tsx', 'layanan-online-desa/_com/administrasi/AdministrasiForm.tsx'])(
    '%s',
    (rel) => {
      const src = SRC(INOVASI + rel);
      expect(src).toContain('color="var(--c-brand-fill)"');
      expect(src).not.toContain('@/con/colors');
    },
  );
});

describe('CSS Inovasi: literal lama diganti token yang nilai terangnya identik', () => {
  it('kartu formulir bersama (inovasi-form.module.css)', () => {
    const css = stripComments(SRC(INOVASI + '_com/inovasi-form.module.css'));
    expect(css).not.toMatch(/#f5f5f7|#1d1d1f|#515154/i);
    expect(css).toContain('background: var(--c-tile);');
    expect(decl(blockOf(css, '.title'), 'color')).toBe('var(--c-ink)');
    expect(decl(blockOf(css, '.lead'), 'color')).toBe('var(--c-ink-2)');
  });

  it('Ajukan Ide: teks/garis bertoken; .formError terang = #fff/#b3261e, gelap merah terang', () => {
    const css = stripComments(SRC(INOVASI + 'ajukan-ide-inovatif/_com/ajukan-ide.module.css'));
    expect(css).not.toMatch(/#1d1d1f|#d2d2d7|#515154/i);
    expect(decl(blockOf(css, '.musyawarah'), 'border-top')).toBe('1px solid var(--c-line-strong)');
    const err = blockOf(css, '.formError');
    expect(decl(err, 'background')).toBe('var(--c-tile-alt)');
    expect(decl(err, 'color')).toBe('light-dark(#b3261e, #ff8a80)');
  });

  it('Kolaborasi: --rule dari --c-line-strong', () => {
    expect(decl(blockOf(SRC(INOVASI + 'kolaborasi-inovasi/_com/kolaborasi.module.css'), '.list'), '--rule')).toBe(
      'var(--c-line-strong)',
    );
  });

  it('dinding mitra: ubin terang = --tile lama, gelap pelat logo #d9e1ea', () => {
    const css = SRC(INOVASI + 'kolaborasi-inovasi/_com/mitra.module.css');
    expect(decl(blockOf(css, '.tile'), 'background')).toBe('light-dark(var(--tile), #d9e1ea)');
    expect(decl(blockOf(css, '.noLogo'), 'color')).toBe('light-dark(var(--subtle), #6e6e73)');
  });

  it('kotak logo detail Program Inovasi: putih terang, pelat #d9e1ea gelap', () => {
    const css = SRC(INOVASI + 'program-inovasi/_com/detail/program-inovasi-detail.module.css');
    expect(decl(blockOf(css, '.logo'), 'background')).toBe('light-dark(#fff, #d9e1ea)');
  });
});

describe('HTML CMS dibungkus penetral rich text (rt.root)', () => {
  it.each([
    INOVASI + 'program-kreatif-desa/_com/detail/ProgramKreatifDetail.tsx',
    INOVASI + 'inovasi-teknologi-desa/_com/detail/InovasiDetail.tsx',
    INOVASI + 'program-inovasi/_com/detail/ProgramInovasiDetail.tsx',
    INOVASI + 'kolaborasi-inovasi/_com/KolaborasiRow.tsx',
    'app/(public)/_com/main-page/landing-page/program-overlay/ProgramOverlayDetail.tsx',
    'app/(public)/(tambahan)/prestasi-desa/[id]/page.tsx',
  ])('%s', (rel) => {
    const src = SRC(rel);
    expect(src).toContain("rich-text/rich-text.module.css");
    expect(src).toContain('rt.root');
  });
});

describe('halaman (tambahan) APBDes / Prestasi / SDGs ikut token', () => {
  it('/apbdes tidak lagi memasang APBDES_BRAND_VARS', () => {
    expect(SRC('app/(public)/(tambahan)/apbdes/page.tsx')).not.toContain('APBDES_BRAND_VARS');
  });

  it('/prestasi-desa/[id] tanpa colors literal: latar halaman putih/hitam, teks & garis brand bertoken', () => {
    const src = SRC('app/(public)/(tambahan)/prestasi-desa/[id]/page.tsx');
    expect(src).not.toContain('@/con/colors');
    // Latar = --c-bg seperti daftar /prestasi-desa (plan-latar-putih-ppid-pemerintahan.md), bukan --c-hero-bg.
    expect(src).toContain('bg="var(--c-bg)"');
    expect(src).not.toContain('--c-hero-bg');
    expect(src).toContain('c="var(--c-brand)"');
    expect(src).toContain('color="var(--c-brand-fill)"');
  });

  it('/sdgs-desa: variabel halaman terang = literal lama, gelap = token + pelat #d9e1ea', () => {
    const css = SRC('app/(public)/(tambahan)/sdgs-desa/sdgs-desa.module.css');
    const page = blockOf(css, '.page');
    expect(decl(page, '--sdgs-goal-title')).toBe('#2e2e2e');
    expect(decl(page, '--sdgs-chart-bg')).toBe('#fbfbfc');
    expect(decl(page, '--sdgs-plate')).toBe('linear-gradient(145deg, #f8f9fa, #fff)');
    const dark = css.slice(css.indexOf('@mixin dark'));
    expect(decl(dark, '--sdgs-goal-title')).toBe('var(--c-ink)');
    expect(decl(dark, '--sdgs-chart-bg')).toBe('var(--c-bg-alt)');
    expect(decl(dark, '--sdgs-plate')).toBe('#d9e1ea');
    const src = SRC('app/(public)/(tambahan)/sdgs-desa/page.tsx');
    expect(src).toContain('c="var(--c-brand)"');
    expect(src).toContain('var(--c-chart-1)');
  });
});
