// @vitest-environment node
// PENJAGA font WOFF2 (plan-performance Fase D). Font situs ('San Francisco') dimuat di semua halaman; WOFF2 ±101 KB
// terkirim vs OTF ±126 KB (gzip CDN). Menjaga: @font-face mendahulukan WOFF2, OTF tetap cadangan, berkasnya ada
// dan benar-benar WOFF2, serta font-display tidak hilang (teks tetap tampil dengan font cadangan saat font dimuat).
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '../..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const globalsCss = readFileSync(path.join(ROOT, 'src/app/globals.css'), 'utf8');

/** Blok @font-face 'San Francisco' (tanpa komentar) dari globals.css. */
function sfFontFace(): string {
  const blocks = globalsCss.replace(/\/\*[\s\S]*?\*\//g, '').match(/@font-face\s*{[^}]*}/g) ?? [];
  const block = blocks.find((b) => /font-family:\s*['"]San Francisco['"]/.test(b));
  if (!block) throw new Error("@font-face 'San Francisco' tidak ditemukan di src/app/globals.css");
  return block;
}

/** Daftar `url(...) format(...)` di deskriptor src, sesuai urutan. */
function srcEntries(block: string): { url: string; format: string }[] {
  const src = block.match(/src:\s*([^;]+);/)?.[1] ?? '';
  return [...src.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)\s*format\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => ({
    url: m[1],
    format: m[2],
  }));
}

describe("@font-face 'San Francisco'", () => {
  const entries = srcEntries(sfFontFace());

  it('mendahulukan WOFF2, OTF sebagai cadangan', () => {
    expect(entries.map((e) => e.format)).toEqual(['woff2', 'opentype']);
    expect(entries[0].url).toMatch(/\.woff2$/);
    expect(entries[1].url).toMatch(/\.otf$/);
  });

  it('berkas WOFF2 ada di public/ dengan signature wOF2', () => {
    const file = path.join(PUBLIC_DIR, entries[0].url);
    expect(existsSync(file), file).toBe(true);
    expect(readFileSync(file).subarray(0, 4).toString('ascii')).toBe('wOF2');
  });

  it('berkas OTF cadangan tetap ada', () => {
    expect(existsSync(path.join(PUBLIC_DIR, entries[1].url))).toBe(true);
  });

  it('font-display: swap tetap ada', () => {
    expect(sfFontFace()).toMatch(/font-display:\s*swap/);
  });
});
