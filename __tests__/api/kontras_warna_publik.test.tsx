// @vitest-environment node
// Juknis lomba 5.7: teks website publik wajib ≥4,5:1 (WCAG AA, teks normal) terhadap latarnya.
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import LayananWaktuBiayaBadge from '@/components/LayananWaktuBiayaBadge';

const AA_TEKS_NORMAL = 4.5;
const PUBLIC_DIR = join(process.cwd(), 'src/app/(public)');
// Latar teks muted di halaman publik: halaman putih dan kartu/ubin #f5f5f7 (pola apple.com).
const LATAR_PUBLIK = { putih: '#ffffff', ubin: '#f5f5f7' } as const;

type Rgba = [number, number, number, number];

function parseWarna(css: string): Rgba {
  const s = css.trim().toLowerCase();
  const hex = s.match(/^#([0-9a-f]{6})$/);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const rgba = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (!rgba) throw new Error(`Format warna tidak dikenali: ${css}`);
  return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), rgba[4] === undefined ? 1 : Number(rgba[4])];
}

/** Warna `fg` semi-transparan di atas `bg` opak → warna opak hasil campuran. */
function campur(fg: Rgba, bg: Rgba): Rgba {
  const [r, g, b, a] = fg;
  return [r * a + bg[0] * (1 - a), g * a + bg[1] * (1 - a), b * a + bg[2] * (1 - a), 1];
}

function luminansi([r, g, b]: Rgba): number {
  const lin = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/** Rasio kontras WCAG 2.x antara dua warna CSS. */
function rasioKontras(fg: string, bg: string): number {
  const latar = parseWarna(bg);
  const depan = campur(parseWarna(fg), latar);
  const [terang, gelap] = [luminansi(depan), luminansi(latar)].sort((a, b) => b - a);
  return (terang + 0.05) / (gelap + 0.05);
}

function cssPublik(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return cssPublik(p);
    return p.endsWith('.css') ? [p] : [];
  });
}

describe('fungsi rasioKontras', () => {
  it('hitam vs putih = 21:1 dan tidak bergantung urutan argumen', () => {
    expect(rasioKontras('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(rasioKontras('#ffffff', '#000000')).toBeCloseTo(21, 5);
  });

  it('cocok dengan angka audit Lighthouse prod (#86868b di #f5f5f7 = 3,32)', () => {
    expect(rasioKontras('#86868b', '#f5f5f7')).toBeCloseTo(3.32, 1);
    expect(rasioKontras('#86868b', '#ffffff')).toBeCloseTo(3.62, 1);
    expect(rasioKontras('#228be6', '#e9f3fd')).toBeCloseTo(3.16, 1);
  });
});

describe('token teks muted "--subtle" / "--sb-subtle" di CSS publik', () => {
  const definisi = cssPublik(PUBLIC_DIR).flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(/^\s*(--(?:sb-)?subtle):\s*(#[0-9a-fA-F]{6});/gm)].map((m) => ({
      file: file.slice(PUBLIC_DIR.length + 1),
      nama: m[1],
      warna: m[2],
    })),
  );

  it('menemukan definisi token (pemindaian tidak kosong)', () => {
    expect(definisi.length).toBeGreaterThanOrEqual(15);
  });

  it.each(Object.entries(LATAR_PUBLIK))('semua definisi ≥4,5:1 di latar %s', (_nama, latar) => {
    const gagal = definisi
      .map((d) => ({ ...d, rasio: rasioKontras(d.warna, latar) }))
      .filter((d) => d.rasio < AA_TEKS_NORMAL)
      .map((d) => `${d.file} ${d.nama}: ${d.warna} = ${d.rasio.toFixed(2)}`);
    expect(gagal).toEqual([]);
  });

  it('teks literal kartu produk UMKM (rating) tidak lagi memakai #86868b', () => {
    const css = readFileSync(join(PUBLIC_DIR, '(pages)/ekonomi/umkm/_com/katalog/produk-card.module.css'), 'utf8');
    const rating = css.match(/\.rating\s*\{[^}]*\}/)?.[0] ?? '';
    expect(rating).toContain('color: #6e6e73');
    expect(rasioKontras('#6e6e73', LATAR_PUBLIK.putih)).toBeGreaterThanOrEqual(AA_TEKS_NORMAL);
  });
});

describe('LayananWaktuBiayaBadge (halaman Layanan)', () => {
  const html = renderToStaticMarkup(
    <MantineProvider>
      <LayananWaktuBiayaBadge estimasiWaktu="1 hari kerja" biaya={0} />
    </MantineProvider>,
  );
  const badge = html.match(/<div[^>]*mantine-Badge-root[^>]*>/)?.[0] ?? '';
  const variabel = (nama: string) => badge.match(new RegExp(`${nama}:\\s*([^;"]+)`))?.[1] ?? '';

  it('teks badge ≥4,5:1 di atas latar badge, yang dicampur di atas putih dan ubin', () => {
    const teks = variabel('--badge-color');
    const bg = variabel('--badge-bg');
    expect(teks).not.toBe('');
    expect(bg).not.toBe('');
    for (const latar of Object.values(LATAR_PUBLIK)) {
      const latarBadge = campur(parseWarna(bg), parseWarna(latar));
      const hex = `#${latarBadge.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
      expect(rasioKontras(teks, hex)).toBeGreaterThanOrEqual(AA_TEKS_NORMAL);
    }
  });

  it('memakai biru brand, bukan biru bawaan Mantine #228be6', () => {
    expect(variabel('--badge-color').toLowerCase()).toBe('#0a4e78');
  });
});
