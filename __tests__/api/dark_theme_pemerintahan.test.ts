// @vitest-environment node
// Dark theme Fase 2, menu Pemerintahan (21 halaman di src/app/(public)/(pages)/pemerintahan):
// 1. tidak ada warna yang disuntik inline (colors[...] / *_BRAND_VARS / c="dark"), kecuali komponen khusus admin,
// 2. setiap isi HTML CMS (dangerouslySetInnerHTML) memakai penetral rich-text (rt.root),
// 3. nilai light-dark(terang, gelap): sisi terang = nilai lama (tema terang identik), tombol isi pakai --c-brand-fill,
// 4. warna mentah di CSS di luar light-dark() hanya yang memang sama di dua tema (overlay foto, warna data, fokus).
// Rencana: MIND/PLAN/plan-dark-theme.md ("Kontrak token", "Fase 2").
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import colors from '@/con/colors';

const ROOT = path.resolve(__dirname, '../../src/app/(public)/(pages)/pemerintahan');
const READ = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');
/** Isi CSS tanpa komentar (komentar boleh menyebut hex/nama variabel). */
const CSS = (rel: string) => READ(rel).replace(/\/\*[\s\S]*?\*\//g, '');
/** Semua file di bawah pemerintahan, path relatif dengan pemisah `/`. */
const FILES = (readdirSync(ROOT, { recursive: true }) as string[]).map((f) => f.split(path.sep).join('/'));
const byExt = (re: RegExp) => FILES.filter((f) => re.test(f));

/** Gabungan isi semua blok `selector { … }` (tanpa blok bersarang); selector bisa ditulis di beberapa blok. */
function block(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const bodies = [...css.matchAll(new RegExp(`(?:^|[\\s}])${escaped}\\s*\\{([^{}]*)\\}`, 'g'))].map((m) => m[1]);
  if (bodies.length === 0) throw new Error(`Blok ${selector} tidak ditemukan`);
  return bodies.join('\n');
}

/** Nilai `light-dark(terang, gelap)` untuk properti/variabel `name` di dalam teks CSS. */
function lightDark(css: string, name: string): { light: string; dark: string } {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Sisi terang boleh memuat rgba(…)/var(…) berkoma; sisi gelap sampai `);` penutup.
  const light = '((?:[^,()]|\\([^()]*\\))+?)';
  const match = css.match(new RegExp(`(?:^|[\\s;{])${escaped}:\\s*light-dark\\(\\s*${light}\\s*,\\s*([^;]+?)\\s*\\);`));
  if (!match) throw new Error(`${name} bukan light-dark(…)`);
  return { light: match[1].toLowerCase(), dark: match[2].toLowerCase() };
}

describe('warna tidak lagi disuntik inline', () => {
  // Dipakai hanya oleh admin (lampiran pengumuman di list-pengumuman/[id]); admin dikunci tema terang.
  const ADMIN_ONLY = ['pengumuman/_com/PengumumanDokumenList.tsx'];
  const TSX = byExt(/\.tsx?$/).filter((f) => !ADMIN_ONLY.includes(f));

  it('ada file yang diperiksa', () => {
    expect(TSX.length).toBeGreaterThan(40);
  });

  it.each(TSX)('%s tanpa colors[...], *_BRAND_VARS, atau c="dark"', (file) => {
    const src = READ(file);
    expect(src).not.toMatch(/from '@\/con\/colors'/);
    expect(src).not.toMatch(/_BRAND_VARS\b/);
    expect(src).not.toMatch(/\bc="dark"/);
  });

  it('PROFIL_VARS tidak lagi membawa --vm-card (diset di .sections, ikut tema)', () => {
    expect(READ('profil/_com/profil.meta.ts')).not.toMatch(/PROFIL_VARS = \{[^}]*--vm-card/);
  });
});

describe('isi HTML CMS memakai penetral rich-text', () => {
  const HTML = byExt(/\.tsx$/).filter((f) => READ(f).includes('dangerouslySetInnerHTML'));

  it('ada file dengan HTML CMS', () => {
    expect(HTML.length).toBeGreaterThan(8);
  });

  it.each(HTML)('%s mengimpor rich-text.module.css dan memasang rt.root', (file) => {
    const src = READ(file);
    expect(src).toMatch(/from ['"]@\/app\/\(public\)\/_com\/rich-text\/rich-text\.module\.css['"]/);
    expect(src).toContain('rt.root');
  });
});

describe('sisi terang light-dark = nilai lama', () => {
  // test-only: pasangan [file, selector, properti, nilai terang lama, nilai gelap].
  const CASES: [string, string, string, string, string][] = [
    ['event-budaya/_com/kalender.module.css', '.page', '--sunday', '#c8102e', '#ff453a'],
    ['event-budaya/_com/kalender.module.css', '.page', '--day-outside', '#c7c7cc', '#7c7c80'],
    ['galery/_lib/galery.module.css', '.vars', '--galery-band', colors['BG-trans'].toLowerCase(), '#13283a'],
    ['galery/_lib/galery.module.css', '.vars', '--galery-surface', colors['white-1'].toLowerCase(), 'var(--c-tile)'],
    ['galery/_lib/galery.module.css', '.vars', '--galery-card', colors['white-trans-1'], 'rgba(255, 255, 255, 0.06)'],
    ['profil/_com/profil.module.css', '.sections', '--vm-card', 'rgb(255 255 255 / 0.5)', 'rgb(255 255 255 / 0.06)'],
    ['profil/_com/profil.module.css', '.sections', '--card-edge', 'rgb(255 255 255 / 0.7)', 'rgb(255 255 255 / 0.08)'],
    ['profil/_com/profil.module.css', '.sections', '--p-rule', '#b1bdd1', 'rgb(255 255 255 / 0.16)'],
    ['profil/ui/perbekel.module.css', '.photoCard', 'background', '#f5f7fb', 'var(--c-tile)'],
    ['profil/ui/riwayat-perbekel.module.css', '.photo', 'background', '#dfe5ef', 'var(--c-placeholder)'],
    ['potensi/_com/potensi.module.css', '.card', 'background', '#fff', 'var(--c-tile)'],
  ];

  it.each(CASES)('%s %s %s', (file, selector, prop, light, dark) => {
    expect(lightDark(block(CSS(file), selector), prop)).toEqual({ light, dark });
  });

  it('brand & teks profil dari token', () => {
    const sections = block(CSS('profil/_com/profil.module.css'), '.sections');
    expect(sections).toContain('--brand: var(--c-brand);');
    expect(sections).toContain('--p-text: var(--c-ink);');
    expect(sections).toContain('--p-muted: var(--c-ink-2);');
  });
});

describe('tombol isi memakai --c-brand-fill + --c-on-brand', () => {
  // test-only: [file, selector] tombol/plat berisi warna brand dengan teks putih.
  const FILLED: [string, string][] = [
    ['layanan/_com/layanan-info.module.css', '.cta'],
    ['layanan/_com/detail/layanan-detail.module.css', '.cta'],
    // .pillPrimary di monev-rows.module.css dihapus bersama bagian Dokumen Perencanaan Monev (pindah ke Arah Kebijakan, 2026-11-18).
    ['arah-kebijakan-pembangunan-desa/_com/arah-kebijakan.module.css', '.btnPrimary'],
    ['potensi/_com/potensi.module.css', '.detailButton'],
    ['pengumuman/_com/detail/pengumuman-detail.module.css', '.btnPrimary'],
    ['profil/ui/moto.module.css', '.letter'],
    ['profil/ui/perbekel.module.css', '.nameBar'],
  ];

  it.each(FILLED)('%s %s', (file, selector) => {
    const body = block(CSS(file), selector);
    expect(body).toContain('background: var(--c-brand-fill);');
    expect(body).toContain('color: var(--c-on-brand);');
  });
});

describe('warna mentah di CSS hanya yang sama di dua tema', () => {
  // test-only: hex/rgba di luar light-dark() yang disengaja: overlay & teks di atas foto, warna data kategori Bali,
  // cincin fokus #0071e3, fallback var(). Bayangan (box-shadow) tidak dihitung.
  const ALLOWED: Record<string, string[]> = {
    'event-budaya/_com/kalender-bali.module.css': ['#e09a1a', '#ffd84d', '#b47f00', 'rgba(224, 154, 26, 0.1)'],
    'event-budaya/_com/agenda-panel.module.css': ['#fff', '#c8102e'],
    'potensi/_com/potensi-header.module.css': ['#0071e3', 'rgba(255, 255, 255, 0.2)'],
    'potensi/_com/potensi-detail.module.css': [
      '#1d1d1f', '#fff', '#dbe6ff', 'rgba(0, 0, 0, 0.75)', 'rgba(0, 0, 0, 0.35)', 'rgba(0, 0, 0, 0)',
      'rgba(29, 29, 31, 0.55)', 'rgba(255, 255, 255, 0.2)', 'rgba(29, 29, 31, 0.75)',
    ],
    'potensi/_com/potensi.module.css': [
      '#1d1d1f', '#fff', '#0071e3', 'rgba(0, 0, 0, 0.78)', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0)',
      'rgba(255, 255, 255, 0.92)',
    ],
    'layanan/_com/layanan-surat.module.css': [
      '#1d1d1f', '#fff', 'rgba(0, 0, 0, 0.72)', 'rgba(0, 0, 0, 0.28)', 'rgba(0, 0, 0, 0)',
    ],
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
    const unexpected = rawColors(CSS(file)).filter((c) => !allowed.includes(c));
    expect(unexpected).toEqual([]);
  });
});
