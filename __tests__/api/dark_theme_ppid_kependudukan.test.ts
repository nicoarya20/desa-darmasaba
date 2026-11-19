// @vitest-environment node
// Tema gelap Fase 2: semua rute /ppid/* dan /kependudukan/dashboard membaca token --c-* (theme-tokens.css).
// Nilai terang dipertahankan lewat light-dark(terang, gelap) sehingga tema terang tetap identik.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = (rel: string) => readFileSync(path.resolve(__dirname, '../../src', rel), 'utf8');
const PPID = (rel: string) => SRC(`app/(public)/(pages)/ppid/${rel}`);
const KEP = (rel: string) => SRC(`app/(public)/(pages)/kependudukan/_com/${rel}`);

/** Nilai deklarasi `--nama: nilai;` pertama di dalam blok CSS. */
const decl = (block: string, name: string) => block.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim();

/** Isi blok selektor pertama yang persis `sel {`. */
const blockOf = (css: string, sel: string) => {
  const start = css.indexOf(`${sel} {`);
  return start < 0 ? '' : css.slice(start, css.indexOf('\n}', start));
};

// Garis di atas latar putih: --c-line-strong (dulu #b1bdd1 untuk latar biru --c-hero-bg).
const RULE = 'light-dark(var(--c-line-strong), rgb(255 255 255 / 0.16))';

/** Isi kaya CMS yang wajib memakai penetral rich-text (`rt.root`). */
// Markup rich text Dasar Hukum, Profil PPID dan detail Daftar Informasi dipecah ke komponen (Batch 1 lomba, 2026-11-18),
// jadi aturannya dicek di komponen tempat dangerouslySetInnerHTML berada.
const RICH_TEXT_FILES = [
  'dasar-hukum/_com/DasarHukumSection.tsx',
  'visi-misi-ppid/_com/VisiMisiContent.tsx',
  'profil-ppid/_com/ProfilPerorangan.tsx',
  'profil-ppid/_com/ProfilLembagaSection.tsx',
  'daftar-informasi-publik/_com/DaftarDetail.tsx',
];

describe('PPID mengikuti token tema', () => {
  it('halaman PPID tidak lagi memakai palet colors (hex terang tetap)', () => {
    for (const rel of [
      'visi-misi-ppid/page.tsx',
      'profil-ppid/page.tsx',
      'daftar-informasi-publik/page.tsx',
      'permohonan-informasi-publik/page.tsx',
      'permohonan-keberatan-informasi-publik/page.tsx',
    ]) {
      const src = PPID(rel);
      expect(src, rel).not.toContain("colors['blue-button']");
      expect(src, rel).not.toContain('colors.Bg');
      expect(src, rel).not.toContain("colors['white-trans-1']");
    }
  });

  it('setiap wadah dangerouslySetInnerHTML memasang rt.root', () => {
    for (const rel of RICH_TEXT_FILES) {
      const src = PPID(rel);
      const wadah = src.split('dangerouslySetInnerHTML').length - 1;
      expect(wadah, rel).toBeGreaterThan(0);
      expect(src, rel).toContain("from '@/app/(public)/_com/rich-text/rich-text.module.css'");
      expect((src.match(/rt\.root/g) ?? []).length, rel).toBe(wadah);
    }
  });

  it('bagian Dasar Hukum: teks token, garis light-dark', () => {
    const sections = blockOf(PPID('_com/ppid-sections.module.css'), '.sections');
    expect(decl(sections, '--ppid-rule')).toBe(RULE);
    expect(decl(sections, '--ppid-text')).toBe('var(--c-ink)');
    expect(decl(sections, '--ppid-muted')).toBe('var(--c-ink-2)');
    expect(PPID('_com/ppid-sections.module.css')).not.toMatch(/#1d1d1f|#515154|#b1bdd1/);
  });

  it('formulir permohonan: kartu ubin --c-tile di atas latar putih/hitam, garis alur light-dark', () => {
    const css = PPID('_com/permohonan.module.css');
    expect(css).toContain('--permohonan-ink: var(--c-ink);');
    expect(css).toContain('--permohonan-muted: var(--c-ink-2);');
    expect(css).toContain('--permohonan-line: light-dark(#8ba8c1, #3d5a78);');
    expect(css).toContain('--permohonan-card: var(--c-tile);');
    expect(blockOf(css, '.card')).toContain('background: var(--permohonan-card);');
  });

  it('tombol kirim permohonan memakai --c-brand-fill', () => {
    const info = PPID('permohonan-informasi-publik/page.tsx');
    expect(info).toContain('bg="var(--c-brand-fill)"');
    expect(PPID('permohonan-keberatan-informasi-publik/page.tsx')).toContain('bg="var(--c-brand-fill)"');
  });

  it('daftar informasi publik: alias token, kartu tabel ubin --c-tile', () => {
    const css = PPID('daftar-informasi-publik/_com/daftar.module.css');
    const body = blockOf(css, '.body');
    expect(decl(body, '--ink')).toBe('var(--c-ink)');
    expect(decl(body, '--muted')).toBe('var(--c-ink-2)');
    expect(decl(body, '--line')).toBe('light-dark(var(--c-line-strong), var(--c-placeholder))');
    expect(decl(body, '--card')).toBe('var(--c-tile)');
    expect(css).not.toMatch(/background:\s*#fff/);
    expect(PPID('daftar-informasi-publik/page.tsx')).toContain('color="var(--c-brand-fill)"');
  });

  it('kartu Visi Misi: ubin --c-tile sebagai cadangan --vm-card, tanpa bayangan, nomor misi brand-fill', () => {
    const css = PPID('visi-misi-ppid/_com/visi-misi.module.css');
    const card = blockOf(css, '.card');
    expect(decl(card, '--vm-text')).toBe('var(--c-ink)');
    expect(decl(card, '--vm-rule')).toBe(RULE);
    expect(card).toContain('background: var(--vm-card, var(--c-tile));');
    expect(card).not.toMatch(/box-shadow|border:/);
    expect(blockOf(css, '.misiNumber')).toMatch(/background: var\(--c-brand-fill\);[\s\S]*color: var\(--c-on-brand\);/);
    const page = PPID('visi-misi-ppid/page.tsx');
    expect(page).not.toContain('CARD_VARS');
    expect(page).not.toMatch(/style=\{/);
  });

  it('Profil PPID: latar --c-bg, kartu ubin --c-tile tanpa bayangan, kartu foto --c-tile-alt', () => {
    const page = PPID('profil-ppid/page.tsx');
    const perorangan = PPID('profil-ppid/_com/ProfilPerorangan.tsx');
    const lembaga = PPID('profil-ppid/_com/ProfilLembagaSection.tsx');
    // 4 keadaan halaman (muat, galat, kosong, isi) berlatar putih/hitam seperti menu lain (plan-latar-putih-ppid-pemerintahan.md).
    expect(page.match(/<Stack[^>]*bg="var\(--c-bg\)"/g)).toHaveLength(4);
    // 3 kartu di halaman + 1 di kartu perorangan + 1 di kartu profil lembaga.
    const tile = (src: string) => src.match(/bg="var\(--c-tile\)"/g)?.length ?? 0;
    expect(tile(page)).toBe(3);
    expect(tile(perorangan)).toBe(1);
    expect(tile(lembaga)).toBe(1);
    expect(perorangan).toContain('<Paper bg="var(--c-tile-alt)" radius="xl" shadow="md" withBorder>');
    for (const [rel, src] of [['page', page], ['perorangan', perorangan], ['lembaga', lembaga]]) {
      expect(src, rel).not.toMatch(/--c-hero-bg|--profil-kaca|shadow="xl"/);
      expect(src, rel).not.toContain("colors['white-trans-1']");
      expect(src, rel).not.toContain("colors['blue-button']");
    }
    expect(PPID('profil-ppid/profil-ppid.module.css')).not.toMatch(/\.page \{|--profil-kaca/);
  });
});

describe('Dashboard Kependudukan mengikuti token tema', () => {
  it('kerangka tidak lagi menimpa --brand lewat KABAR_BRAND_VARS', () => {
    const page = KEP('frame/KependudukanPage.tsx');
    expect(page).not.toContain('KABAR_BRAND_VARS');
    expect(page).not.toMatch(/style=\{/);
  });

  it('rel navigasi section: kaca light-dark dan pil aktif brand-fill', () => {
    const css = KEP('frame/section-nav.module.css');
    expect(css).toContain('background: light-dark(rgba(255, 255, 255, 0.92), rgba(0, 0, 0, 0.8));');
    expect(css).toContain('box-shadow: 0 1px 0 light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.1));');
    expect(blockOf(css, '.pill[aria-current="location"]')).toMatch(
      /background: var\(--c-brand-fill\);\s*color: var\(--c-on-brand\);/,
    );
    expect(css).not.toMatch(/#e8e8ed|color: #fff/);
  });

  it('ubin umur dan kerangka kartu hero tanpa hex terang tetap', () => {
    const umur = KEP('umur/umur.module.css');
    expect(umur).toMatch(/background: var\(--c-tile\);\s*color: var\(--c-ink\);/);
    expect(umur).not.toMatch(/#6e6e73|#f5f5f7|#1d1d1f/);
    expect(KEP('frame/hero.module.css')).not.toContain('#e8e8ed');
  });
});

describe('tombol Kirim permohonan nonaktif terbaca di gelap', () => {
  it('kelas .submit hanya menimpa warna teks nonaktif di gelap (terang = bawaan Mantine)', () => {
    const css = PPID('_com/permohonan.module.css');
    expect(css).toMatch(/\.submit:is\(:disabled, \[data-disabled\]\) \{\s*@mixin dark \{\s*color: rgb\(255 255 255 \/ 70%\);\s*\}\s*\}/);
    for (const rel of ['permohonan-informasi-publik/page.tsx', 'permohonan-keberatan-informasi-publik/page.tsx']) {
      expect(PPID(rel), rel).toContain('className={s.submit}');
    }
  });
});
