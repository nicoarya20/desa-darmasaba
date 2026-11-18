// @vitest-environment node
// Juknis lomba 5.4: CLS mobile 0,16 di PageSpeed berasal dari pergantian font (swap) hero saat font.otf selesai diunduh
// (±6 dtk di sinyal lambat). `font-display: optional` meniadakan pergantian itu. Test ini menjaga agar @font-face situs
// tidak kembali ke `swap`/`auto`/`block` (yang menimbulkan pergantian setelah tampil).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { ROOT_STATIC_FILE_SOURCE } from '@/lib/static-cache-headers';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

/** Semua blok @font-face (isi di antara kurung kurawal) tanpa komentar. */
function fontFaces(): string[] {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...noComments.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
}

describe('@font-face situs publik', () => {
  const faces = fontFaces();

  it('ada font web yang dimuat dari /assets/fonts/font.otf (penjaga tidak kosong)', () => {
    expect(faces.some((f) => f.includes("url('/assets/fonts/font.otf')"))).toBe(true);
  });

  it('setiap @font-face memakai font-display: optional', () => {
    expect(faces.length).toBeGreaterThan(0);
    for (const face of faces) {
      expect(face).toMatch(/font-display:\s*optional\s*;/);
    }
  });

  it('tidak ada @font-face dengan swap/auto/block/fallback', () => {
    for (const face of faces) {
      expect(face).not.toMatch(/font-display:\s*(swap|auto|block|fallback)\b/);
    }
  });

  it('berkas font di /assets/ tercakup aturan cache 30 hari (font optional baru terpakai di kunjungan berikutnya)', () => {
    const next = readFileSync(join(process.cwd(), 'next.config.ts'), 'utf8');
    expect(next).toContain("'/assets/:path*'");
    // pola akar public/ juga ada, tapi font hidup di /assets/: pastikan aturan /assets memakai STATIC_CACHE_HEADERS
    expect(next).toMatch(/source:\s*'\/assets\/:path\*',\s*headers:\s*STATIC_CACHE_HEADERS/);
    expect(typeof ROOT_STATIC_FILE_SOURCE).toBe('string');
  });
});
