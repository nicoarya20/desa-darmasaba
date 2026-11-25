// @vitest-environment node
// Tema gelap Fase 2: menu Keamanan (12 rute) membaca token --c-* (theme-tokens.css).
// Nilai terang dipertahankan lewat light-dark(terang, gelap) atau alias token bernilai terang sama, jadi tema terang identik.
// Peta (tile OSM CCTV, iframe Google Maps Polsek) tetap terang: keputusan final user 2026-11-18.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as cctvMeta from '@/app/(public)/(pages)/keamanan/cctv/_com/cctv.meta';
import * as polsekMeta from '@/app/(public)/(pages)/keamanan/polsek-terdekat/_com/polsek.meta';

const KEAMANAN = (rel: string) => readFileSync(path.resolve(__dirname, '../../src/app/(public)/(pages)/keamanan', rel), 'utf8');

/** Buang komentar blok, JSX, dan baris (`//` setelah `:` dipertahankan agar URL `https://` tak terpotong). */
const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

/** Nilai deklarasi `nama: nilai;` pertama di dalam blok CSS. */
const decl = (block: string, name: string) => block.match(new RegExp(`(?:^|[\\s;{])${name}:\\s*([^;]+);`))?.[1].trim();

/** Isi blok selektor pertama yang persis `sel {`. */
const blockOf = (css: string, sel: string) => {
  const start = css.indexOf(`${sel} {`);
  return start < 0 ? '' : css.slice(start, css.indexOf('\n}', start));
};

const HOVER_TILE = 'light-dark(#e8e8ed, #3a3a3c)';

describe('Keamanan tanpa *_BRAND_VARS inline dan palet @/con/colors', () => {
  const PAGES = [
    'cctv/_com/CctvPage.tsx',
    'kontak-darurat/_com/KontakKeamananList.tsx',
    'polsek-terdekat/_com/PolsekTerdekatPage.tsx',
    'pencegahan-kriminalitas/_com/PencegahanPage.tsx',
    'pencegahan-kriminalitas/_com/detail/PencegahanDetail.tsx',
    'keamanan-lingkungan-pecalang-patwal/_com/KeamananLingkunganPage.tsx',
    'keamanan-lingkungan-pecalang-patwal/_com/detail/KeamananLingkunganDetail.tsx',
    'pencegahan-kriminalitas/_com/tips/TipsSection.tsx',
    'laporan-publik/_com/LaporanPublikPage.tsx',
    'laporan-publik/_com/detail/LaporanDetail.tsx',
    'laporan-publik/_com/LaporanForm.tsx',
  ];

  it.each(PAGES)('%s tidak memasang style brand inline', (rel) => {
    const src = KEAMANAN(rel);
    expect(src).not.toMatch(/_BRAND_VARS/);
    expect(src).not.toContain('@/con/colors');
  });

  it('ekspor CCTV_BRAND_VARS dan POLSEK_BRAND_VARS (lokal, tanpa pemakai) sudah dihapus', () => {
    expect('CCTV_BRAND_VARS' in cctvMeta).toBe(false);
    expect('POLSEK_BRAND_VARS' in polsekMeta).toBe(false);
    expect(KEAMANAN('cctv/_com/cctv.meta.ts')).not.toContain('@/con/colors');
    expect(KEAMANAN('polsek-terdekat/_com/polsek.meta.ts')).not.toContain('@/con/colors');
  });

  it('tombol Kirim laporan (modal portal) memakai --c-brand-fill', () => {
    expect(KEAMANAN('laporan-publik/_com/LaporanForm.tsx')).toContain('color="var(--c-brand-fill)"');
  });

  it('isi HTML CMS memakai penetral rich text', () => {
    for (const rel of [
      'pencegahan-kriminalitas/_com/detail/PencegahanDetail.tsx',
      'keamanan-lingkungan-pecalang-patwal/_com/detail/KeamananLingkunganDetail.tsx',
      'pencegahan-kriminalitas/_com/tips/TipCard.tsx',
      'laporan-publik/_com/detail/LaporanLinimasa.tsx',
    ]) {
      const src = KEAMANAN(rel);
      expect(src, rel).toContain('dangerouslySetInnerHTML');
      expect(src, rel).toContain('rt.root');
    }
  });
});

describe('CCTV: UI ikut tema, peta tetap pulau terang', () => {
  const css = KEAMANAN('cctv/_com/cctv.module.css');
  const explorer = KEAMANAN('cctv/_com/cctv-explorer.module.css');

  it('.page memberi tint brand + status (terang = nilai lama)', () => {
    const page = blockOf(css, '.page');
    expect(decl(page, '--brand-tint')).toBe('var(--c-brand-tint)');
    expect(decl(page, '--cctv-tint-online')).toBe('light-dark(var(--mantine-color-green-0), rgb(47 158 68 / 18%))');
    expect(decl(page, '--cctv-tint-offline')).toBe('light-dark(var(--mantine-color-red-0), rgb(224 49 49 / 18%))');
    expect(decl(page, '--cctv-tint-unknown')).toBe('light-dark(var(--mantine-color-gray-1), rgb(255 255 255 / 10%))');
    expect(KEAMANAN('cctv/_com/CctvPage.tsx')).toContain('${s.page}');
  });

  it('STATUS_META: aksen palet tetap (penanda di peta terang), tint dari variabel tema', () => {
    expect(cctvMeta.STATUS_META.online).toEqual({ accent: 'var(--mantine-color-green-8)', tint: 'var(--cctv-tint-online)' });
    expect(cctvMeta.STATUS_META.offline).toEqual({ accent: 'var(--mantine-color-red-8)', tint: 'var(--cctv-tint-offline)' });
    expect(cctvMeta.STATUS_META.unknown).toEqual({ accent: 'var(--mantine-color-gray-5)', tint: 'var(--cctv-tint-unknown)' });
  });

  it('ubin, baris terpilih, cari, dan tombol coba lagi memakai token', () => {
    expect(decl(blockOf(css, '.retry'), 'background')).toBe('var(--c-tile-alt)');
    expect(css).toContain(`.retry:hover {\n    background: ${HOVER_TILE};`);
    expect(decl(blockOf(explorer, '.mapFrame'), 'background')).toBe('var(--c-placeholder)');
    expect(decl(blockOf(explorer, '.mapEmpty'), 'background')).toBe('var(--c-tile-alt)');
    expect(decl(blockOf(explorer, '.search'), '--tile')).toBe('var(--c-tile-alt)');
    expect(decl(blockOf(explorer, '.row[aria-pressed="true"]'), 'background')).toBe('var(--c-tile-alt)');
  });

  it('.map = pulau terang: color-scheme light + alias dikunci ke nilai terang token', () => {
    const map = stripComments(blockOf(explorer, '.map'));
    expect(decl(map, 'color-scheme')).toBe('light');
    expect(decl(map, '--brand')).toBe('#0a4e78');
    expect(decl(map, '--ink')).toBe('#1d1d1f');
    expect(decl(map, '--muted')).toBe('#6e6e73');
    // light-dark() diubah postcss-preset-mantine jadi aturan atribut; di pulau terang akan tetap memilih nilai gelap.
    expect(map).not.toContain('light-dark(');
    expect(decl(blockOf(explorer, '.popup'), 'color')).toBe('var(--ink)');
    expect(decl(blockOf(explorer, '.popupKode'), 'color')).toBe('var(--brand)');
    expect(decl(blockOf(explorer, '.popupLokasi'), 'color')).toBe('var(--muted)');
  });

  it('tile peta tidak diganti (peta tetap terang, keputusan final user)', () => {
    expect(KEAMANAN('cctv/_com/CctvMapSection.tsx')).toContain('url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"');
  });
});

describe('Polsek Terdekat', () => {
  const css = KEAMANAN('polsek-terdekat/_com/polsek.module.css');

  it('.page memberi --brand-tint token; ubin jarak & pil peta ikut tema', () => {
    expect(decl(blockOf(css, '.page'), '--brand-tint')).toBe('var(--c-brand-tint)');
    expect(KEAMANAN('polsek-terdekat/_com/PolsekTerdekatPage.tsx')).toContain('${page.page} ${s.page}');
    expect(decl(blockOf(css, '.distance'), 'background')).toBe('var(--c-tile-alt)');
    const pick = blockOf(css, ".pick[aria-pressed='true']");
    expect(decl(pick, 'background')).toBe('var(--c-brand-fill)');
    expect(decl(pick, 'color')).toBe('var(--c-on-brand)');
    expect(css).toContain(`.pick:not([aria-pressed='true']):hover {\n    background: ${HOVER_TILE};`);
  });

  it('penanda buka 24 jam: terang = hijau lama, gelap = hijau sistem', () => {
    expect(decl(blockOf(css, '.open24'), 'color')).toBe('light-dark(#1d7a34, #30d158)');
    expect(decl(blockOf(css, '.dot'), 'background')).toBe('light-dark(#30a14e, #30d158)');
  });
});

describe('Laporan Publik', () => {
  it('pil status: terang = warna lama, gelap = tint transparan + teks terang', () => {
    const css = KEAMANAN('laporan-publik/_com/laporan-status.module.css');
    expect(decl(blockOf(css, '.selesai'), 'background')).toBe('light-dark(#e6f4ea, rgb(48 209 88 / 16%))');
    expect(decl(blockOf(css, '.selesai'), 'color')).toBe('light-dark(#19733a, #30d158)');
    expect(decl(blockOf(css, '.proses'), 'color')).toBe('light-dark(#8f5100, #ffb340)');
    expect(decl(blockOf(css, '.gagal'), 'color')).toBe('light-dark(#c4001a, #ff6961)');
    expect(decl(blockOf(css, '.baru'), 'background')).toBe('light-dark(#e6eef6, var(--c-brand-tint))');
    expect(decl(blockOf(css, '.lain'), 'color')).toBe('light-dark(#6e6e73, var(--c-muted))');
  });

  it('tombol Tambah Laporan = tombol isi brand (bukan --brand gelap yang terlalu terang untuk teks putih)', () => {
    const add = blockOf(KEAMANAN('laporan-publik/_com/laporan.module.css'), '.addButton');
    expect(decl(add, 'background')).toBe('var(--c-brand-fill)');
    expect(decl(add, 'color')).toBe('var(--c-on-brand)');
  });

  it('modal formulir (portal) memakai token --c-* langsung', () => {
    const css = KEAMANAN('laporan-publik/_com/laporan-form.module.css');
    expect(decl(blockOf(css, '.modalTitle'), 'color')).toBe('var(--c-ink)');
    expect(decl(blockOf(css, '.note'), 'background')).toBe('var(--c-tile)');
    expect(decl(blockOf(css, '.note'), 'color')).toBe('var(--c-muted)');
  });

  it('linimasa detail: pusat penanda = latar halaman, nada mengikuti pil status', () => {
    const css = KEAMANAN('laporan-publik/_com/detail/laporan-detail.module.css');
    expect(decl(blockOf(css, '.marker'), 'background')).toBe('var(--c-bg)');
    expect(decl(blockOf(css, '.step[data-tone="selesai"] .marker'), 'background')).toBe('light-dark(#19733a, #30d158)');
    expect(decl(blockOf(css, '.step[data-tone="gagal"] .marker'), 'background')).toBe('light-dark(#c4001a, #ff6961)');
    expect(decl(blockOf(css, '.step[data-tone="lain"] .marker'), 'border-color')).toBe('var(--c-subtle)');
    expect(decl(blockOf(css, '.retry'), 'background')).toBe('var(--c-tile-alt)');
  });
});

describe('Kerangka gaya Kabar (Pencegahan, Tips): latar placeholder dari token', () => {
  it('ubin video/foto kosong memakai --c-placeholder', () => {
    const pencegahan = stripComments(KEAMANAN('pencegahan-kriminalitas/_com/pencegahan.module.css'));
    expect(pencegahan).not.toContain('#e8e8ed');
    expect(decl(blockOf(pencegahan, '.video'), 'background')).toBe('var(--c-placeholder)');
    expect(decl(blockOf(pencegahan, '.videoMissing'), 'background')).toBe('var(--c-placeholder)');
    expect(stripComments(KEAMANAN('pencegahan-kriminalitas/_com/tips/tips-keamanan.module.css'))).not.toContain('#e8e8ed');
  });
});
