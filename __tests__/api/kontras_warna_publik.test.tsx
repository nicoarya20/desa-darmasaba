// @vitest-environment node
// Juknis lomba 5.7: teks website publik wajib ≥4,5:1 (WCAG AA, teks normal) terhadap latarnya.
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_THEME, MantineProvider } from '@mantine/core';
import LayananWaktuBiayaBadge from '@/components/LayananWaktuBiayaBadge';
import { ACCENT } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/posyandu.meta';
import { varWarnaKategori } from '@/app/(public)/(pages)/pemerintahan/event-budaya/_com/agenda.meta';
import { KATEGORI_EVENT_COLOR } from '@/lib/agenda-desa';

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

// Token bersama tema terang/gelap: blok pertama = terang, blok kedua = gelap (src/app/theme-tokens.css).
const TOKENS_CSS = readFileSync(join(process.cwd(), 'src/app/theme-tokens.css'), 'utf8');
const [subtleTerang, subtleGelap] = [...TOKENS_CSS.matchAll(/^\s*--c-subtle:\s*(#[0-9a-fA-F]{6})/gm)].map((m) => m[1]);
const LATAR_GELAP = ['#000000', '#1d1d1f', '#2a2a2c'];

describe('token teks muted "--subtle" / "--sb-subtle" di CSS publik', () => {
  const definisi = [
    ...cssPublik(PUBLIC_DIR).flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/^\s*(--(?:sb-)?subtle):\s*(#[0-9a-fA-F]{6});/gm)].map((m) => ({
        file: file.slice(PUBLIC_DIR.length + 1),
        nama: m[1],
        warna: m[2],
      })),
    ),
    // Modul beranda memakai var(--c-subtle) sejak tema gelap, jadi nilai terangnya dicek dari sumber token.
    { file: '../theme-tokens.css', nama: '--c-subtle (terang)', warna: subtleTerang },
  ];

  it('menemukan definisi token (pemindaian tidak kosong)', () => {
    expect(subtleTerang).toBeDefined();
    expect(subtleGelap).toBeDefined();
    expect(definisi.length).toBeGreaterThanOrEqual(10);
  });

  it.each(LATAR_GELAP)('--c-subtle tema gelap ≥4,5:1 di latar %s', (latar) => {
    expect(rasioKontras(subtleGelap, latar)).toBeGreaterThanOrEqual(AA_TEKS_NORMAL);
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

/** Memecah nilai CSS hasil `var(--mantine-color-<warna>-<shade>)` / `color-mix(...)` / hex menjadi hex opak. */
function resolveMantine(nilai: string): string {
  const mix = nilai.match(/^color-mix\(in srgb,\s*(.+?),\s*#000\s+(\d+)%\)$/);
  if (mix) {
    const [r, g, b] = parseWarna(resolveMantine(mix[1]));
    const sisa = 1 - Number(mix[2]) / 100;
    const hex = (v: number) => Math.round(v * sisa).toString(16).padStart(2, '0');
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  }
  const v = nilai.match(/^var\(--mantine-color-([a-z]+)-(\d)\)$/);
  if (v) return DEFAULT_THEME.colors[v[1]][Number(v[2])];
  return nilai;
}

describe('Posyandu: teks aksen kartu profil (ACCENT["--accent-text"])', () => {
  it.each(Object.keys(ACCENT) as (keyof typeof ACCENT)[])('%s ≥4,5:1 di atas --tint dan #f5f5f7', (nama) => {
    const gaya = ACCENT[nama] as Record<string, string>;
    const teks = resolveMantine(gaya['--accent-text']);
    expect(rasioKontras(teks, resolveMantine(gaya['--tint']))).toBeGreaterThanOrEqual(AA_TEKS_NORMAL);
    expect(rasioKontras(teks, LATAR_PUBLIK.ubin)).toBeGreaterThanOrEqual(AA_TEKS_NORMAL);
  });

  it('aksen lama teal-7/oranye-7 memang gagal (audit prod 2,8–2,9:1) sehingga varian teks diperlukan', () => {
    expect(rasioKontras('#0ca678', '#e6fcf5')).toBeLessThan(AA_TEKS_NORMAL);
    expect(rasioKontras('#f76707', '#fff4e6')).toBeLessThan(AA_TEKS_NORMAL);
  });
});

describe('Agenda: tinta teks kategori acara (--ev-ink) di atas --ev-bg', () => {
  it.each(Object.entries(KATEGORI_EVENT_COLOR))('%s (%s) ≥4,5:1 di --ev-bg, putih, dan #f5f5f7', (_kategori, warna) => {
    const gaya = varWarnaKategori(warna) as Record<string, string>;
    const ink = resolveMantine(gaya['--ev-ink']);
    for (const latar of [resolveMantine(gaya['--ev-bg']), LATAR_PUBLIK.putih, LATAR_PUBLIK.ubin]) {
      expect(rasioKontras(ink, latar)).toBeGreaterThanOrEqual(AA_TEKS_NORMAL);
    }
  });
});

describe('Agenda ponsel: acara lewat tidak diredupkan dengan opacity', () => {
  it('.card[data-lewat] tanpa opacity (opacity menurunkan kontras teks)', () => {
    const css = readFileSync(
      join(PUBLIC_DIR, '(pages)/pemerintahan/event-budaya/_com/kalender-ponsel.module.css'),
      'utf8',
    );
    const blok = css.match(/\.card\[data-lewat\]\s*\{[^}]*\}/)?.[0] ?? '';
    expect(blok).not.toBe('');
    expect(blok).not.toMatch(/opacity/);
  });
});
