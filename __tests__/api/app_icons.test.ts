// @vitest-environment node
// Ikon situs seukuran pakai (rencana performa Putaran 4): favicon 48, apple-touch-icon 180 (opak), ikon manifest 192.
// Sebelumnya ketiganya PNG 238px 101 KB (`darmasaba-icon.png`) yang di manifest dilabeli 192 & 512 → browser mengunduh
// berkas lebih besar dari perlu dan label tidak jujur. Test ini menjaga: berkas ada, ukuran piksel asli (IHDR) = label,
// byte di bawah ambang, apple-touch-icon tanpa alpha, dan theme_color manifest = THEME_COLOR.light.
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { THEME_COLOR } from '@/lib/color-scheme-scope';

const ROOT = path.resolve(__dirname, '../..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OLD_ICON = 'darmasaba-icon.png';

/** Favicon tampil ≤ 32 CSS px → 64 px cukup untuk layar 2x. */
const MAX_FAVICON_PX = 64;
/** Ambang byte (PNG lama 101083 B). Laporan sesi 61: icon-48 5974 B; apple-touch-icon-180 35665 B; icon-192 68139 B. */
const MAX_FAVICON_BYTES = 10_000;
const MAX_ICON_BYTES = 80_000;
/** Ukuran apple-touch-icon iOS (60 pt @3x). */
const APPLE_TOUCH_PX = 180;
/** Ikon manifest minimum agar Chrome Android mau memasang PWA. */
const MIN_MANIFEST_ICON_PX = 192;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
/** IHDR color type: 0 = grayscale, 2 = RGB (keduanya tanpa kanal alpha). */
const OPAQUE_COLOR_TYPES = [0, 2];

type PngInfo = { width: number; height: number; colorType: number; hasTrns: boolean; bytes: number };

/** Baca header PNG langsung dari buffer (tanpa dependency): IHDR selalu chunk pertama setelah signature. */
function readPng(urlPath: string): PngInfo {
  const file = path.join(PUBLIC_DIR, urlPath);
  const buf = readFileSync(file);
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error(`${urlPath} bukan berkas PNG (signature tidak cocok)`);
  if (buf.toString('ascii', 12, 16) !== 'IHDR') throw new Error(`${urlPath}: chunk pertama bukan IHDR`);
  let hasTrns = false;
  for (let off = 8; off + 8 <= buf.length; ) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    if (type === 'tRNS') hasTrns = true;
    if (type === 'IDAT' || type === 'IEND') break; // tRNS wajib sebelum IDAT
    off += 12 + len;
  }
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
    colorType: buf[25],
    hasTrns,
    bytes: statSync(file).size,
  };
}

/** "48x48" → [48, 48]; label tak valid → error dengan konteks. */
function parseSize(label: string, where: string): [number, number] {
  const m = /^(\d+)x(\d+)$/.exec(label);
  if (!m) throw new Error(`${where}: label ukuran "${label}" bukan format WxH`);
  return [Number(m[1]), Number(m[2])];
}

const maxBytesFor = (px: number) => (px <= MAX_FAVICON_PX ? MAX_FAVICON_BYTES : MAX_ICON_BYTES);

// ---------------------------------------------------------------------------------------------------------------
// manifest.json
// ---------------------------------------------------------------------------------------------------------------
type ManifestIcon = { src: string; sizes: string; type: string };
const manifest = JSON.parse(readFileSync(path.join(PUBLIC_DIR, 'manifest.json'), 'utf8')) as {
  theme_color: string;
  icons: ManifestIcon[];
};

describe('public/manifest.json', () => {
  it('punya minimal satu ikon dan tidak menunjuk PNG lama', () => {
    expect(manifest.icons.length).toBeGreaterThan(0);
    for (const icon of manifest.icons) expect(icon.src).not.toContain(OLD_ICON);
  });

  it.each(manifest.icons.map((icon) => [icon.src, icon] as const))(
    '%s: berkas ada, PNG, ukuran asli = label sizes, byte di bawah ambang',
    (src, icon) => {
      expect(src.startsWith('/')).toBe(true);
      expect(existsSync(path.join(PUBLIC_DIR, src))).toBe(true);
      expect(icon.type).toBe('image/png');
      const png = readPng(src);
      // Label bisa berisi beberapa ukuran ("192x192 512x512"); setiap label harus = ukuran asli,
      // jadi tak ada ikon yang mengaku lebih besar dari berkasnya.
      const labels = icon.sizes.split(/\s+/).map((s) => parseSize(s, src));
      expect(labels.length).toBeGreaterThan(0);
      for (const [w, h] of labels) expect([w, h]).toEqual([png.width, png.height]);
      expect(png.bytes).toBeLessThanOrEqual(maxBytesFor(png.width));
    },
  );

  it(`ada ikon minimal ${MIN_MANIFEST_ICON_PX}px (syarat pasang PWA)`, () => {
    const widths = manifest.icons.map((icon) => readPng(icon.src).width);
    expect(Math.max(...widths)).toBeGreaterThanOrEqual(MIN_MANIFEST_ICON_PX);
  });

  it('theme_color sama dengan THEME_COLOR.light (meta theme-color terang)', () => {
    expect(manifest.theme_color).toBe(THEME_COLOR.light);
  });
});

// ---------------------------------------------------------------------------------------------------------------
// metadata.icons di src/app/layout.tsx
// ---------------------------------------------------------------------------------------------------------------
// layout.tsx dibaca sebagai teks, bukan diimpor: ia mengimpor CSS global, MusicProvider, SiteMantineProvider, dan
// react-toastify yang tidak relevan dan rawan gagal di Vitest node. Pola sama dengan gate_splash/theme_toggle test.
const LAYOUT_SRC = readFileSync(path.join(ROOT, 'src/app/layout.tsx'), 'utf8');

/** Isi objek `icons: { ... }` (hitung kurung kurawal, jadi aman untuk objek/array bersarang). */
function iconsBlock(src: string): string {
  const start = src.search(/\bicons\s*:\s*\{/);
  if (start < 0) throw new Error('layout.tsx: metadata.icons tidak ditemukan');
  const open = src.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return src.slice(open + 1, i);
  }
  throw new Error('layout.tsx: kurung kurawal metadata.icons tidak tertutup');
}

/** Potongan teks milik satu kunci (`icon` / `apple`) di dalam blok icons: dari kunci itu sampai kunci berikutnya. */
function entrySegment(block: string, key: 'icon' | 'apple'): string {
  const keyRe = /(?:^|[\s,{])(icon|apple|shortcut|other)\s*:/g;
  const hits = [...block.matchAll(keyRe)].map((m) => ({ key: m[1], at: m.index! }));
  const idx = hits.findIndex((h) => h.key === key);
  if (idx < 0) throw new Error(`layout.tsx: metadata.icons.${key} tidak ditemukan`);
  return block.slice(hits[idx].at, hits[idx + 1]?.at ?? block.length);
}

type LayoutIcon = { url: string; sizes: string | undefined };

/** Ambil url + sizes dari bentuk string, objek `{ url, sizes }`, atau array objek. */
function layoutIcons(key: 'icon' | 'apple'): LayoutIcon[] {
  const seg = entrySegment(iconsBlock(LAYOUT_SRC), key);
  const urls = [...seg.matchAll(/["'](\/[^"']+\.(?:png|ico|svg|webp|jpe?g))["']/g)].map((m) => m[1]);
  const sizes = [...seg.matchAll(/\bsizes\s*:\s*["']([^"']+)["']/g)].map((m) => m[1]);
  if (urls.length === 0) throw new Error(`layout.tsx: metadata.icons.${key} tanpa url ikon`);
  return urls.map((url, i) => ({ url, sizes: sizes[i] }));
}

describe('metadata.icons di src/app/layout.tsx', () => {
  it.each(['icon', 'apple'] as const)('%s: tidak menunjuk PNG lama dan berkasnya ada di public/', (key) => {
    for (const { url } of layoutIcons(key)) {
      expect(url).not.toContain(OLD_ICON);
      expect(existsSync(path.join(PUBLIC_DIR, url))).toBe(true);
    }
  });

  it.each(['icon', 'apple'] as const)('%s: berlabel sizes yang sama dengan ukuran asli PNG', (key) => {
    for (const { url, sizes } of layoutIcons(key)) {
      expect(sizes, `${key} ${url} wajib punya sizes`).toBeDefined();
      const png = readPng(url);
      expect(parseSize(sizes!, url)).toEqual([png.width, png.height]);
      expect(png.bytes).toBeLessThanOrEqual(maxBytesFor(png.width));
    }
  });

  it(`favicon (icon) tidak lebih dari ${MAX_FAVICON_PX}px`, () => {
    for (const { url } of layoutIcons('icon')) expect(readPng(url).width).toBeLessThanOrEqual(MAX_FAVICON_PX);
  });

  it(`apple-touch-icon ${APPLE_TOUCH_PX}x${APPLE_TOUCH_PX} dan opak (iOS mengisi bagian transparan dengan hitam)`, () => {
    for (const { url } of layoutIcons('apple')) {
      const png = readPng(url);
      expect([png.width, png.height]).toEqual([APPLE_TOUCH_PX, APPLE_TOUCH_PX]);
      expect(OPAQUE_COLOR_TYPES).toContain(png.colorType);
      expect(png.hasTrns).toBe(false);
    }
  });
});
