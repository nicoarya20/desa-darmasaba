// @vitest-environment node
// Dark theme Fase 2, menu Ekonomi (17 halaman termasuk detail UMKM/Lowongan/BUMDes/Program Kemiskinan):
// 1. warna brand tidak lagi disuntik inline (*_BRAND_VARS / colors.ts) di halaman Ekonomi,
// 2. variabel lokal modul (--ink/--muted/--line/--brand …) = alias token --c-*, latar halaman --c-bg,
// 3. tombol & lencana isi memakai --c-brand-fill + --c-on-brand, warna grafik = var(--c-chart-n),
// 4. token --pi-* (program-info, dipakai BUMDes/Lingkungan/Pendidikan) = alias token.
// Rencana: MIND/PLAN/plan-dark-theme.md ("Kontrak token", "Fase 2").
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { SERI_WARNA } from '@/app/(public)/(pages)/ekonomi/_com/pengangguran/pengangguran.meta';

const EKO = 'app/(public)/(pages)/ekonomi';
const SRC = (rel: string) => readFileSync(path.resolve(__dirname, '../../src', rel), 'utf8');
/** Isi CSS tanpa komentar (komentar boleh menyebut nilai hex lama). */
const CSS = (rel: string) => SRC(rel).replace(/\/\*[\s\S]*?\*\//g, '');

/** Isi blok `selector { … }` pertama (tanpa blok bersarang). */
function block(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`(?:^|[\\s}])${escaped}\\s*\\{([^{}]*)\\}`));
  if (!match) throw new Error(`Blok ${selector} tidak ditemukan`);
  return match[1];
}

describe('warna brand tidak lagi inline di halaman Ekonomi', () => {
  const FILES = [
    'umkm/page.tsx',
    'umkm/_com/katalog/SaringDrawer.tsx',
    'umkm/_com/detail-toko/DetailTokoView.tsx',
    'umkm/_com/detail-produk/DetailProdukView.tsx',
    'lowongan-kerja-lokal/page.tsx',
    'lowongan-kerja-lokal/_com/FilterDrawer.tsx',
    'lowongan-kerja-lokal/_com/detail/LowonganDetail.tsx',
    'kesejahteraan-masyarakat/_com/KesejahteraanPage.tsx',
    'kesejahteraan-masyarakat/_com/detail/KesejahteraanDetail.tsx',
    '_com/pengangguran/UsiaKerjaMenganggurPage.tsx',
    '_com/pengangguran/JumlahPengangguranPage.tsx',
    'jumlah-penduduk-miskin/_com/PendudukMiskinPage.tsx',
    'sektor-unggulan-desa/_com/SektorUnggulanPage.tsx',
    'program-kemiskinan/_com/ProgramKemiskinanPage.tsx',
    'program-kemiskinan/_com/detail/ProgramKemiskinanDetail.tsx',
    'program-kemiskinan/_com/detail/ProgramDetailBody.tsx',
    'program-kemiskinan/_com/detail/RekapAlamatView.tsx',
    'program-kemiskinan/_com/detail/DaftarPenerimaView.tsx',
    'demografi-pekerjaan/_com/DemografiPekerjaanPage.tsx',
    'PADesa-pendapatan-asli-desa/_com/PadesaPage.tsx',
    'Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/BumdesPage.tsx',
    'Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/detail/PengurusDetail.tsx',
  ];

  it.each(FILES)('%s tanpa *_BRAND_VARS, colors.ts, dan c="dark"', (file) => {
    const src = SRC(`${EKO}/${file}`);
    expect(src).not.toMatch(/BRAND_VARS/);
    expect(src).not.toContain('@/con/colors');
    expect(src).not.toContain('c="dark"');
  });

  it('variabel brand lokal tanpa pemakai sudah dihapus dari meta', () => {
    expect(SRC(`${EKO}/umkm/_com/katalog/katalog-filter.meta.ts`)).not.toContain('KATALOG_BRAND_VARS');
    expect(SRC(`${EKO}/lowongan-kerja-lokal/_com/lowongan-filter.meta.ts`)).not.toContain('LOWONGAN_BRAND_VARS');
    expect(SRC(`${EKO}/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/bumdes.meta.ts`)).not.toContain('BUMDES_VARS');
  });

  it('detail Program Kemiskinan: latar hero = token --c-hero-bg (terang = #D1D9E8 lama)', () => {
    expect(SRC(`${EKO}/program-kemiskinan/_com/detail/ProgramKemiskinanDetail.tsx`)).toContain('bg="var(--c-hero-bg)"');
  });
});

describe('alias token di wadah halaman', () => {
  const PAGES = [
    'umkm/_com/katalog/katalog-layout.module.css',
    'umkm/_com/detail-umkm/detail-umkm.module.css',
    'lowongan-kerja-lokal/_com/lowongan-layout.module.css',
  ];

  it.each(PAGES)('%s .page = alias --c-* + latar --c-bg', (file) => {
    const body = block(CSS(`${EKO}/${file}`), '.page');
    for (const decl of [
      '--ink: var(--c-ink);',
      '--muted: var(--c-muted);',
      '--subtle: var(--c-subtle);',
      '--tile: var(--c-tile);',
      '--line: var(--c-line-strong);',
      '--brand: var(--c-brand);',
      'background: var(--c-bg);',
    ]) {
      expect(body).toContain(decl);
    }
    expect(body).not.toMatch(/#[0-9a-f]{3,6}\b/i);
  });

  it('filter Lowongan: alias token, tint/garis brand punya nilai gelap sendiri', () => {
    const css = CSS(`${EKO}/lowongan-kerja-lokal/_com/filter.module.css`);
    expect(css).toMatch(/\.panel,\s*\.chips,\s*\.drawer\s*\{\s*--ink: var\(--c-ink\);/);
    // Terang: campuran ke putih (nilai lama); gelap: token tint + garis brand diredupkan ke hitam.
    expect(css).toContain('--brand-tint: color-mix(in srgb, var(--brand) 9%, #fff);');
    expect(css).toMatch(/@mixin dark \{\s*--brand-tint: var\(--c-brand-tint\);\s*--brand-line: color-mix\(in srgb, var\(--brand\) 40%, #000\);/);
  });

  it('Pengangguran: garis tabel dari token', () => {
    expect(CSS(`${EKO}/_com/pengangguran/pengangguran.module.css`)).toContain('--rule: var(--c-line-strong);');
  });
});

describe('tombol & lencana isi memakai --c-brand-fill + --c-on-brand', () => {
  const CASES: [string, string][] = [
    ['umkm/_com/katalog/katalog-layout.module.css', '.saringBadge'],
    ['umkm/_com/katalog/saring.module.css', '.groupBadge'],
    ['umkm/_com/katalog/saring.module.css', '.drawerApply'],
    ['lowongan-kerja-lokal/_com/lowongan-layout.module.css', '.filterBadge'],
    ['lowongan-kerja-lokal/_com/filter.module.css', '.drawerApply'],
  ];

  it.each(CASES)('%s %s', (file, selector) => {
    const body = block(CSS(`${EKO}/${file}`), selector);
    expect(body).toContain('background: var(--c-brand-fill);');
    expect(body).toContain('color: var(--c-on-brand);');
  });
});

describe('grafik & token bersama', () => {
  it('seri grafik Pengangguran = token chart (terang = #0a4e78 / #2f91cc lama)', () => {
    expect(SERI_WARNA).toEqual({ terdidik: 'var(--c-chart-1)', tidakTerdidik: 'var(--c-chart-2)' });
  });

  it('program-info .tokens (BUMDes, Lingkungan, Pendidikan) = alias token', () => {
    const body = block(CSS('app/(public)/(pages)/pendidikan/_com/program-info/program-info.module.css'), '.tokens');
    expect(body).toContain('--pi-ink: var(--c-ink);');
    expect(body).toContain('--pi-muted: var(--c-ink-2);');
    expect(body).toContain('--pi-rule: var(--c-line-strong);');
    expect(body).toContain('--pi-tile: var(--c-tile);');
  });
});
