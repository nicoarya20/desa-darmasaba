// @vitest-environment node
// Dark theme Fase 3, menu Pendidikan (src/app/(public)/(pages)/pendidikan, termasuk modul bersama program-info dan
// page-frame yang juga dipakai Lingkungan & BUMDes):
// 1. tidak ada warna yang disuntik inline (colors.ts / *_BRAND_VARS / c="dark"), --brand dkk. diset di CSS .page,
// 2. setiap isi HTML CMS (dangerouslySetInnerHTML) memakai penetral rich-text (rt.root),
// 3. variabel lokal = alias token --c-* yang nilai terangnya = literal lama (tema terang identik),
// 4. nilai light-dark(terang, gelap): sisi terang = nilai lama; tombol isi pakai --c-brand-fill + --c-on-brand,
// 5. warna mentah di CSS di luar light-dark() hanya yang memang sama di dua tema (di atas gradasi/sampul, oranye pita).
// Rencana: MIND/PLAN/plan-dark-theme.md ("Kontrak token", "Fase 3").
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(__dirname, '../../src');
const ROOT = path.join(SRC, 'app/(public)/(pages)/pendidikan');
const READ = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');
/** Isi CSS tanpa komentar (komentar boleh menyebut hex/nama variabel). */
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const CSS = (rel: string) => strip(READ(rel));
/** Semua file di bawah pendidikan, path relatif dengan pemisah `/`. */
const FILES = (readdirSync(ROOT, { recursive: true }) as string[]).map((f) => f.split(path.sep).join('/'));
const byExt = (re: RegExp) => FILES.filter((f) => re.test(f));

/** Gabungan isi semua blok `selector { … }` (tanpa blok bersarang); selector bisa ditulis di beberapa blok. */
function block(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const bodies = [...css.matchAll(new RegExp(`(?:^|[\\s},])${escaped}\\s*\\{([^{}]*)\\}`, 'g'))].map((m) => m[1]);
  if (bodies.length === 0) throw new Error(`Blok ${selector} tidak ditemukan`);
  return bodies.join('\n');
}

/** Nilai deklarasi `name: …;` di dalam isi blok. */
function decl(body: string, name: string): string | undefined {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return body.match(new RegExp(`(?:^|[\\s;{])${escaped}:\\s*([^;]+);`))?.[1].trim();
}

describe('warna tidak lagi disuntik inline', () => {
  const TS = byExt(/\.tsx?$/);

  it('ada file yang diperiksa', () => {
    expect(TS.length).toBeGreaterThan(60);
  });

  it.each(TS)('%s tanpa colors.ts, *_BRAND_VARS, atau c="dark"', (file) => {
    const src = READ(file);
    expect(src).not.toMatch(/from ['"]@\/con\/colors['"]/);
    expect(src).not.toMatch(/_BRAND_VARS\b/);
    expect(src).not.toMatch(/\bc="dark"/);
  });

  it('tombol kirim formulir Beasiswa memakai token isi', () => {
    expect(READ('beasiswa-desa/_com/form/BeasiswaFormModal.tsx')).toContain('brandColor="var(--c-brand-fill)"');
  });

  it('penanda jenjang biru = --c-chart-1 (terang = biru brand lama)', () => {
    const meta = READ('info-sekolah/_com/info-sekolah.meta.ts');
    expect(meta).toContain('"var(--c-chart-1)"');
    expect(meta).not.toMatch(/colors\[/);
  });

  it('sampul buku ilustrasi Perpustakaan = token isi, bukan --brand teks', () => {
    const src = READ('perpustakaan-digital/_com/PerpusIlustrasi.tsx');
    expect(src).toContain(
      "const SAMPUL = ['var(--c-brand-fill)', '#2f91cc', '#8ac1e3', 'var(--c-brand-fill-hover)', '#5da9d8'] as const;",
    );
  });
});

describe('isi HTML CMS memakai penetral rich-text', () => {
  const HTML = byExt(/\.tsx$/).filter((f) => READ(f).includes('dangerouslySetInnerHTML'));

  it('ada file dengan HTML CMS', () => {
    expect(HTML).toContain('_com/program-info/ProgramInfoSection.tsx');
  });

  it.each(HTML)('%s mengimpor rich-text.module.css dan memasang rt.root', (file) => {
    const src = READ(file);
    expect(src).toMatch(/from ['"]@\/app\/\(public\)\/_com\/rich-text\/rich-text\.module\.css['"]/);
    expect(src).toMatch(/className=\{`\$\{s\.prose\} \$\{rt\.root\}`\} dangerouslySetInnerHTML/);
  });
});

describe('variabel lokal = alias token --c-*', () => {
  // test-only: [file, selector, { variabel: nilai }].
  const ALIASES: [string, string, Record<string, string>][] = [
    ['_com/page-frame/page-frame.module.css', '.frame', { background: 'var(--c-bg)' }],
    ['_com/program-info/program-info.module.css', '.page', { '--brand': 'var(--c-brand)' }],
    [
      'beasiswa-desa/_com/beasiswa.module.css',
      '.page',
      {
        '--brand': 'var(--c-brand)',
        '--ink': 'var(--c-ink)',
        '--muted': 'var(--c-muted)',
        '--subtle': 'var(--c-subtle)',
        '--tile': 'var(--c-tile)',
      },
    ],
    [
      'data-pendidikan/_com/data-pendidikan.module.css',
      '.page',
      {
        '--brand': 'var(--c-brand)',
        '--brand-hover': 'var(--c-brand-hover)',
        '--ink': 'var(--c-ink)',
        '--subtle': 'var(--c-subtle)',
      },
    ],
    [
      'info-sekolah/_com/info-sekolah.module.css',
      '.page',
      {
        '--brand': 'var(--c-brand)',
        '--brand-tint': 'var(--c-brand-tint)',
        '--accent': 'var(--c-brand)',
        '--tint': 'var(--c-brand-tint)',
        '--ink': 'var(--c-ink)',
        '--muted': 'var(--c-muted)',
        '--subtle': 'var(--c-subtle)',
        '--tile': 'var(--c-tile)',
        '--line': 'var(--c-line)',
      },
    ],
    [
      'perpustakaan-digital/_com/perpus-page.module.css',
      '.page',
      { '--brand': 'var(--c-brand)', '--brand-tint': 'var(--c-brand-tint)', '--accent': '#fcae00', color: 'var(--c-ink)' },
    ],
  ];

  it.each(ALIASES)('%s %s', (file, selector, expected) => {
    const body = block(CSS(file), selector);
    for (const [name, value] of Object.entries(expected)) expect(decl(body, name), name).toBe(value);
  });

  it('kerangka .tokens (Lingkungan, BUMDes) tidak menimpa --brand wadahnya', () => {
    const css = CSS('_com/program-info/program-info.module.css');
    expect(block(css, '.tokens')).not.toMatch(/--brand:/);
  });

  // Bukti tema terang identik: nilai terang token yang dipakai di atas = literal lama modul-modul ini.
  it('nilai terang token = literal lama', () => {
    const root = block(strip(readFileSync(path.join(SRC, 'app/theme-tokens.css'), 'utf8')), ':root');
    const OLD: Record<string, string> = {
      '--c-bg': '#fff',
      '--c-ink': '#1d1d1f',
      '--c-ink-2': '#515154',
      '--c-muted': '#6e6e73',
      '--c-subtle': '#86868b',
      '--c-tile': '#f5f5f7',
      '--c-tile-alt': '#fff',
      '--c-placeholder': '#e8e8ed',
      '--c-line': 'rgba(0, 0, 0, 0.08)',
      '--c-line-strong': '#d2d2d7',
      '--c-brand': '#0a4e78',
      '--c-brand-hover': '#083f61',
      '--c-brand-fill': '#0a4e78',
      '--c-brand-fill-hover': '#083f61',
      '--c-on-brand': '#fff',
      '--c-brand-tint': '#e5f2fa',
      '--c-footer-from': '#1c6ea4',
      '--c-footer-to': '#124170',
      '--c-chart-1': '#0a4e78',
    };
    for (const [name, value] of Object.entries(OLD)) expect(decl(root, name), name).toBe(value);
  });
});

describe('sisi terang light-dark = nilai lama', () => {
  // test-only: [file, selector, properti, nilai lengkap].
  const CASES: [string, string, string, string][] = [
    ['beasiswa-desa/_com/form/beasiswa-form.module.css', '.alert', 'background', 'light-dark(#fde8ea, rgb(255 69 58 / 16%))'],
    ['beasiswa-desa/_com/form/beasiswa-form.module.css', '.alert', 'color', 'light-dark(#c4001a, #ff6961)'],
    [
      'perpustakaan-digital/_com/perpus-hero.module.css',
      '.art',
      'background',
      'linear-gradient(145deg, var(--brand-tint) 0%, light-dark(#b8daef, #1a3d5c) 100%)',
    ],
    ['perpustakaan-digital/_com/perpus-hero.module.css', '.window', 'background', 'light-dark(#fff, var(--c-tile))'],
    [
      'perpustakaan-digital/_com/perpus-hero.module.css',
      '.window',
      'border',
      '1px solid light-dark(rgb(10 78 120 / 12%), var(--c-line))',
    ],
    ['perpustakaan-digital/_com/perpus-hero.module.css', '.bar', 'background', 'light-dark(#fbfbfc, var(--c-tile-alt))'],
    ['perpustakaan-digital/_com/perpus-hero.module.css', '.bar', 'border-bottom', '1px solid light-dark(#ececf0, var(--c-line))'],
    ['perpustakaan-digital/_com/perpus-hero.module.css', '.address', 'background', 'light-dark(#f5f5f7, #3a3a3c)'],
    ['perpustakaan-digital/_com/perpus-hero.module.css', '.address', 'color', 'light-dark(#6e6e73, var(--c-ink-2))'],
    ['perpustakaan-digital/_com/perpus-aksi.module.css', '.pillLight', 'background', 'light-dark(#fff, #d9e1ea)'],
    ['perpustakaan-digital/_com/perpus-aksi.module.css', '.pillLight:hover', 'background', 'light-dark(#e5f2fa, #c3cfdc)'],
    [
      'perpustakaan-digital/_com/perpus-bagian.module.css',
      '.closing',
      'background',
      'linear-gradient(135deg, var(--c-footer-from), var(--c-footer-to))',
    ],
  ];

  it.each(CASES)('%s %s %s', (file, selector, prop, value) => {
    expect(decl(block(CSS(file), selector), prop)).toBe(value);
  });

  it('teks di atas gradasi penutup Perpustakaan tetap terang (bukan --brand-tint yang di gelap jadi navy)', () => {
    const css = CSS('perpustakaan-digital/_com/perpus-bagian.module.css');
    expect(decl(block(css, '.closingText'), 'color')).toBe('#e5f2fa');
    expect(decl(block(css, '.closing'), 'color')).toBe('#fff');
  });
});

describe('tombol isi memakai --c-brand-fill + --c-on-brand', () => {
  // test-only: [file, selector, selector hover].
  const FILLED: [string, string, string | null][] = [
    ['beasiswa-desa/_com/beasiswa.module.css', '.pill', '.pill:hover'],
    ['perpustakaan-digital/_com/perpus-aksi.module.css', '.pill', '.pill:hover'],
    ['perpustakaan-digital/_com/perpus-bagian.module.css', '.stepNumber', null],
  ];

  it.each(FILLED)('%s %s', (file, selector, hover) => {
    const css = CSS(file);
    const body = block(css, selector);
    expect(decl(body, 'background')).toBe('var(--c-brand-fill)');
    expect(decl(body, 'color')).toBe('var(--c-on-brand)');
    if (hover) expect(decl(block(css, hover), 'background')).toBe('var(--c-brand-fill-hover)');
  });
});

describe('warna mentah di CSS hanya yang sama di dua tema', () => {
  // test-only: hex/rgb di luar light-dark() yang disengaja: teks/ikon putih & teks biru di atas gradasi/pelat penutup,
  // cincin fokus putih, sorot sampul buku, oranye pita penanda buku. Bayangan (box-shadow) tidak dihitung.
  const ALLOWED: Record<string, string[]> = {
    'perpustakaan-digital/_com/perpus-page.module.css': ['#fcae00'],
    'perpustakaan-digital/_com/perpus-hero.module.css': [
      'rgb(255 255 255 / 22%)', 'rgb(255 255 255 / 55%)', 'rgb(255 255 255 / 35%)',
    ],
    'perpustakaan-digital/_com/perpus-bagian.module.css': ['#fff', '#e5f2fa'],
    'perpustakaan-digital/_com/perpus-aksi.module.css': ['#0a4e78', '#fff'],
  };
  const COLOR = /#[0-9a-f]{3,8}\b|rgba?\([^()]*\)/gi;

  /** Warna di luar light-dark(…) dan di luar box-shadow. */
  function rawColors(css: string): string[] {
    return css
      .split('\n')
      .filter((line) => !/box-shadow/.test(line))
      .map((line) => line.replace(/light-dark\((?:[^()]|\([^()]*\))*\)/g, ''))
      .flatMap((line) => line.match(COLOR) ?? [])
      .map((c) => c.toLowerCase());
  }

  it.each(byExt(/\.module\.css$/))('%s', (file) => {
    const allowed = ALLOWED[file] ?? [];
    expect(rawColors(CSS(file)).filter((c) => !allowed.includes(c))).toEqual([]);
  });
});
