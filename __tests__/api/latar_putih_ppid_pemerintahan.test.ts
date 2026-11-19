// @vitest-environment node
// PENJAGA: menu PPID & Pemerintahan berlatar putih/hitam (--c-bg) seperti menu lain (acuan /kesehatan/program-kesehatan,
// /pemerintahan/berita/semua). --c-hero-bg (#d1d9e8 / #0e1620) khusus hero beranda dan tidak boleh lagi jadi latar
// halaman di area ini. Rencana: MIND/PLAN/plan-latar-putih-ppid-pemerintahan.md. Berkas cadangan *.txt diabaikan.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const PUBLIC_DIR = path.resolve(__dirname, '../../src/app/(public)');
const SOURCE_EXT = /\.(tsx?|css)$/;

/** Area yang dijaga: folder (rekursif) atau satu berkas, relatif ke src/app/(public). */
const GUARDED = [
  '(pages)/ppid',
  '(pages)/pemerintahan',
  '(tambahan)/prestasi-desa/[id]/page.tsx',
  '(tambahan)/permohonan/berhasil',
];

/** Semua berkas sumber (.ts/.tsx/.css) di bawah `rel`, relatif ke PUBLIC_DIR. */
function sourceFiles(rel: string): string[] {
  const abs = path.join(PUBLIC_DIR, rel);
  if (statSync(abs).isFile()) return SOURCE_EXT.test(rel) ? [rel] : [];
  return readdirSync(abs).flatMap((name) => sourceFiles(path.join(rel, name)));
}

/** Kode tanpa komentar: komentar boleh menyebut token lama (mis. "dulu --c-hero-bg"), pemakaiannya tidak. */
const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

const read = (rel: string) => readFileSync(path.join(PUBLIC_DIR, rel), 'utf8');

describe('stripComments', () => {
  it('membuang komentar blok dan baris, mempertahankan URL dan kode', () => {
    const src = [
      '/* latar lama: var(--c-hero-bg) */',
      "const a = 'https://contoh.desa.id'; // dulu var(--c-hero-bg)",
      '.x { background: var(--c-hero-bg); }',
    ].join('\n');
    const out = stripComments(src);
    expect(out).toContain("'https://contoh.desa.id'");
    expect(out.match(/--c-hero-bg/g)).toHaveLength(1);
  });
});

describe('latar putih menu PPID & Pemerintahan', () => {
  const files = GUARDED.flatMap(sourceFiles);

  it('area yang dijaga berisi berkas sumber (bukan glob kosong)', () => {
    expect(files.length).toBeGreaterThan(20);
    expect(files.some((f) => f.endsWith('.txt'))).toBe(false);
  });

  it.each(files)('%s tidak memakai --c-hero-bg', (rel) => {
    expect(stripComments(read(rel))).not.toMatch(/--c-hero-bg/);
  });

  it('kerangka PpidPage berlatar --c-bg', () => {
    expect(read('(pages)/ppid/_com/PpidPage.tsx')).toContain('bg="var(--c-bg)"');
  });

  it('profil pegawai bagan (PPID & Perangkat Desa) punya latar --c-bg sendiri, kartu ubin --c-tile', () => {
    const css = read('_com/struktur-organisasi/struktur-detail.module.css');
    expect(css).toMatch(/\.page\s*\{[^}]*background:\s*var\(--c-bg\)/);
    expect(css).toMatch(/\.paper\s*\{[^}]*background:\s*var\(--c-tile\)/);
    expect(read('_com/struktur-organisasi/StrukturDetailView.tsx')).toContain('className={s.page}');
    expect(read('_com/struktur-organisasi/StrukturDetail.tsx')).toContain('className={s.page}');
  });

  it('kartu Visi Misi & tabel Daftar Informasi = ubin --c-tile (bukan putih/kaca di atas latar putih)', () => {
    expect(read('(pages)/ppid/visi-misi-ppid/_com/visi-misi.module.css')).toContain('background: var(--vm-card, var(--c-tile));');
    expect(read('(pages)/ppid/daftar-informasi-publik/_com/daftar.module.css')).toContain('--card: var(--c-tile);');
  });
});
