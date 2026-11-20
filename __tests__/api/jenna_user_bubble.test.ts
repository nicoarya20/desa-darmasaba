// @vitest-environment node
// Gelembung pesan pengunjung Jenna = biru pekat gaya iMessage (masukan 2026-11-20). Penjaga: teks putih 14px wajib
// lolos AA 4,5:1, jadi biru iOS #007aff/#0a84ff (4,0:1 / 3,6:1) tidak boleh dipakai di sini.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const CSS = readFileSync(path.resolve(__dirname, '../../src/app/(public)/_com/jenna/jenna.module.css'), 'utf8');

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function msgUserRule(): string {
  const match = CSS.match(/\n\.msgUser \{([^}]*)\}/);
  if (!match) throw new Error('Aturan .msgUser tidak ditemukan di jenna.module.css');
  return match[1];
}

describe('gelembung pengunjung Jenna', () => {
  it('memakai biru pekat dengan teks putih', () => {
    const rule = msgUserRule();
    expect(rule).toMatch(/--jenna-user-bubble: #0071e3;/);
    expect(rule).toMatch(/background: var\(--jenna-user-bubble\);/);
    expect(rule).toMatch(/color: #fff;/);
  });

  it('kontras teks putih di atas birunya lolos AA 4,5:1', () => {
    const bubble = msgUserRule().match(/--jenna-user-bubble: (#[0-9a-f]{6});/i)?.[1];
    expect(bubble).toBeDefined();
    expect(contrast(bubble as string, '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });

  it('biru iOS bawaan memang gagal AA (alasan memakai #0071e3)', () => {
    expect(contrast('#007aff', '#ffffff')).toBeLessThan(4.5);
    expect(contrast('#0a84ff', '#ffffff')).toBeLessThan(4.5);
  });
});
