// @vitest-environment node
// Tema gelap: /desa-anti-korupsi ikut token lewat `.section` (Fase 1); detail, halaman program, PPID IKM, dan
// /permohonan/berhasil ikut token sejak Fase 2 (tidak ada lagi "pulau terang").
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as kepuasanMeta from '@/app/(public)/_com/main-page/kepuasan/kepuasan.meta';

const SRC = (rel: string) => readFileSync(path.resolve(__dirname, '../../src', rel), 'utf8');
/** Buang komentar blok, JSX, dan baris (`//` setelah `:` dipertahankan agar URL `https://` tak terpotong). */
const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

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

  it('ekspor ANTIKORUPSI_BRAND_VARS sudah dihapus (dead code sejak token)', () => {
    expect(SRC('app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.meta.ts')).not.toContain('ANTIKORUPSI_BRAND_VARS');
  });

  it('.section mengambil --brand dari token --c-brand', () => {
    const section = blockOf(SRC('app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.module.css'), '.section');
    expect(decl(section, '--brand')).toBe('var(--c-brand)');
    expect(decl(section, '--brand-hover')).toBe('var(--c-brand-hover)');
  });
});

describe('/desa-anti-korupsi/detail & /program/[id] ikut tema', () => {
  const DAK = 'app/(public)/(tambahan)/desa-anti-korupsi/';

  it('halaman tidak lagi memasang ANTIKORUPSI_BRAND_VARS / FOLDER_BRAND_VARS inline', () => {
    for (const rel of ['detail/page.tsx', 'program/[id]/page.tsx', '_com/FolderChips.tsx']) {
      const src = SRC(DAK + rel);
      expect(src).not.toContain('ANTIKORUPSI_BRAND_VARS');
      expect(src).not.toContain('FOLDER_BRAND_VARS');
      expect(src).not.toMatch(/style=\{/);
    }
  });

  it('.page meng-alias token global (terang = nilai lama) dan berlatar --c-bg', () => {
    const page = blockOf(SRC(DAK + '_com/antikorupsi-detail.module.css'), '.page');
    for (const [local, token] of [
      ['--ink', '--c-ink'],
      ['--muted', '--c-muted'],
      ['--subtle', '--c-subtle'],
      ['--tile', '--c-tile'],
      ['--line', '--c-line'],
      ['--brand', '--c-brand'],
    ]) {
      expect(decl(page, local)).toBe(`var(${token})`);
    }
    expect(decl(page, 'background')).toBe('var(--c-bg)');
  });

  it('pil aktif & aksi hover memakai --c-brand-fill + --c-on-brand (bukan teks brand + putih)', () => {
    const css = SRC(DAK + '_com/antikorupsi-detail.module.css');
    const pill = blockOf(css, '.pill[aria-pressed="true"]');
    expect(decl(pill, 'background')).toBe('var(--c-brand-fill)');
    expect(decl(pill, 'color')).toBe('var(--c-on-brand)');
  });

  it('komponen halaman program tidak memakai warna literal @/con/colors untuk teks/tombol brand', () => {
    for (const rel of [
      '_com/ProgramHeader.tsx',
      '_com/ProgramBreadcrumb.tsx',
      '_com/FolderList.tsx',
      '_com/FolderAktif.tsx',
      '_com/FolderChips.tsx',
      '_com/DokumenRingkasList.tsx',
      '_com/UnduhZipButton.tsx',
      'program/[id]/page.tsx',
    ]) {
      // Komentar boleh menyebut nilai hex (dokumentasi token); yang diuji hanya kode.
      const src = stripComments(SRC(DAK + rel));
      expect(src, rel).not.toContain("colors['blue-button");
      expect(src, rel).not.toMatch(/#[0-9a-fA-F]{6}\b/);
    }
  });

  it('deskripsi program (HTML CMS) memakai penetral rich text', () => {
    expect(SRC(DAK + '_com/ProgramHeader.tsx')).toContain('rt.root');
  });
});

describe('/permohonan/berhasil ikut tema', () => {
  it('tidak memakai warna literal; kartu membaca variabel light-dark dari .root', () => {
    const page = SRC('app/(public)/(tambahan)/permohonan/berhasil/page.tsx');
    expect(page).not.toContain('@/con/colors');
    expect(page).not.toMatch(/#[0-9a-fA-F]{6}\b/);
    const root = blockOf(SRC('app/(public)/(tambahan)/permohonan/berhasil/berhasil.module.css'), '.root');
    expect(decl(root, '--sukses-bg')).toBe('light-dark(#def0d8, #14301c)');
    expect(decl(root, '--sukses-ink')).toBe('light-dark(#3c7745, #8fd19e)');
  });
});

describe('/ppid/indeks-kepuasan-masyarakat', () => {
  it('KEPUASAN_BRAND_VARS sudah dihapus dan halaman tidak memasang style tambahan', () => {
    expect('KEPUASAN_BRAND_VARS' in kepuasanMeta).toBe(false);
    const page = SRC('app/(public)/(pages)/ppid/indeks-kepuasan-masyarakat/page.tsx');
    expect(page).not.toContain('KEPUASAN_BRAND_VARS');
    expect(page).not.toMatch(/style=\{/);
  });

  it('.surface tidak lagi mengunci token grafik ke nilai terang; kartu putih terang, --c-tile gelap', () => {
    const surface = blockOf(SRC('app/(public)/(pages)/ppid/indeks-kepuasan-masyarakat/_com/ikm.module.css'), '.surface');
    for (const token of ['--c-tile', '--c-chart-1', '--c-chart-2', '--c-chart-3', '--chart-text-color']) {
      expect(decl(surface, token)).toBeUndefined();
    }
    expect(decl(surface, '--ink')).toBe('var(--c-ink)');
    expect(decl(surface, '--muted')).toBe('var(--c-muted)');
    expect(decl(surface, '--tile')).toBe('light-dark(#fff, var(--c-tile))');
  });

  it('kerangka PpidPage berlatar --c-hero-bg dan --brand dari token', () => {
    const page = SRC('app/(public)/(pages)/ppid/_com/PpidPage.tsx');
    expect(page).not.toContain('@/con/colors');
    expect(page).toContain('bg="var(--c-hero-bg)"');
    expect(page).toContain("'--brand': 'var(--c-brand)'");
  });
});
