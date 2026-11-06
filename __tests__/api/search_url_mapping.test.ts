// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import getDetailUrl, { normalizeSearchType } from '@/app/darmasaba/_com/searchUrl';

const ROOT = path.resolve(__dirname, '../..');
const FIND_MANY = path.join(ROOT, 'src/app/api/[[...slugs]]/_lib/search/findMany.ts');
const GLOBAL_SEARCH = path.join(ROOT, 'src/app/darmasaba/_com/globalSearch.tsx');
const DARMASABA_DIR = path.join(ROOT, 'src/app/darmasaba');
const HOME = '/darmasaba';

/**
 * Tipe yang SENGAJA tidak punya URL detail.
 * - responden / permohonaninformasipublik / permohonaninformasikeberatanpublik:
 *   data pribadi warga, tidak boleh punya halaman publik. Penghapusannya dari
 *   pencarian dikerjakan di task terpisah (T20/F1-02).
 * - mediaSosial: tujuannya link eksternal (iconUrl / wa.me), bukan halaman
 *   internal; dites terpisah di bawah.
 */
const NO_INTERNAL_URL = new Set([
  'responden',
  'permohonaninformasipublik',
  'permohonaninformasikeberatanpublik',
  'mediaSosial',
]);
const PRIVATE_DATA_TYPES = ['responden', 'permohonaninformasipublik', 'permohonaninformasikeberatanpublik'];

/** Ambil semua `type: "..."` yang dikirim API pada blok GLOBAL SEARCH. */
function globalSearchTypes(): string[] {
  const src = readFileSync(FIND_MANY, 'utf8');
  const start = src.indexOf('GLOBAL SEARCH');
  expect(start).toBeGreaterThan(-1);
  const types = [...src.slice(start).matchAll(/type:\s*["']([A-Za-z]+)["']/g)].map((m) => m[1]);
  return [...new Set(types)];
}

/** Daftar route publik (segmen URL) dari page.tsx di src/app/darmasaba; route group `(x)` dibuang. */
function publicRoutes(): string[][] {
  const files = readdirSync(DARMASABA_DIR, { recursive: true, encoding: 'utf8' })
    .filter((f) => path.basename(f) === 'page.tsx');
  return files.map((f) => [
    'darmasaba',
    ...path.dirname(f).split(path.sep).filter((s) => s !== '.' && !/^\(.*\)$/.test(s)),
  ]);
}

/** Cocokkan URL ke route nyata. Segmen dinamik `[x]` match apa saja, kecuali placeholder `[sub]`. */
function matchesRealPage(url: string, routes: string[][]): boolean {
  const segs = url.split('?')[0].split('/').filter(Boolean);
  return routes.some(
    (route) =>
      route.length === segs.length &&
      route.every((r, i) => (/^\[.+\]$/.test(r) ? r !== '[sub]' : r === segs[i])),
  );
}

const sampleItem = (type: string) => ({ type, id: 'abc123', kategori: 'umum', name: 'Contoh' });

describe('pemetaan URL hasil pencarian global', () => {
  const types = globalSearchTypes();
  const routes = publicRoutes();

  it('blok GLOBAL SEARCH terbaca dan memuat tipe camelCase', () => {
    expect(types.length).toBeGreaterThan(80);
    expect(types).toContain('galleryFoto');
    expect(types).toContain('pelayananPendudukNonPermanen');
  });

  it('(a) setiap tipe dari API dipetakan ke URL selain beranda, kecuali pengecualian bernama', () => {
    const unmapped = types
      .filter((t) => !NO_INTERNAL_URL.has(t))
      .filter((t) => getDetailUrl(sampleItem(t)) === HOME);
    expect(unmapped).toEqual([]);
  });

  it('(a) tipe data pribadi tidak punya URL', () => {
    for (const t of PRIVATE_DATA_TYPES) {
      expect(types).toContain(t);
      expect(getDetailUrl(sampleItem(t))).toBe(HOME);
    }
  });

  it('(b) setiap URL internal hasil peta cocok dengan page.tsx yang benar-benar ada (bukan placeholder [sub])', () => {
    const broken = types
      .filter((t) => !NO_INTERNAL_URL.has(t))
      .map((t) => ({ type: t, url: getDetailUrl(sampleItem(t)) }))
      .filter(({ url }) => !matchesRealPage(url, routes));
    expect(broken).toEqual([]);
  });

  it('(b) pencocok route tidak menganggap placeholder [sub] sebagai halaman nyata', () => {
    expect(matchesRealPage('/darmasaba/ekonomi/pasar-desa', routes)).toBe(false);
    expect(matchesRealPage('/darmasaba/desa/potensi', routes)).toBe(true);
  });

  it('(c) normalisasi tipe hanya trim, tidak mengubah huruf camelCase', () => {
    expect(normalizeSearchType('galleryFoto')).toBe('galleryFoto');
    expect(normalizeSearchType('  programKesehatan ')).toBe('programKesehatan');
    expect(normalizeSearchType(undefined)).toBe('');
    expect(getDetailUrl({ id: 1, type: normalizeSearchType(' galleryFoto ') })).toBe('/darmasaba/desa/galery/foto');
  });

  it('(c) handleSelect di globalSearch.tsx memakai normalizeSearchType, bukan toLowerCase', () => {
    const src = readFileSync(GLOBAL_SEARCH, 'utf8');
    expect(src).toMatch(/normalizeSearchType\(rawItem\.type\)/);
    expect(src).not.toMatch(/\.type[^\n]*\.toLowerCase\(\)/);
  });

  it('kategoriBerita membuka daftar berita kategori itu (slug lowercase seperti tab berita)', () => {
    expect(getDetailUrl({ type: 'kategoriBerita', id: 'k1', name: 'Pemerintahan' })).toBe(
      '/darmasaba/desa/berita/pemerintahan',
    );
  });

  it('pasarDesa membuka detail produk UMKM', () => {
    expect(getDetailUrl({ type: 'pasarDesa', id: 'p1' })).toBe('/darmasaba/ekonomi/umkm/produk/p1');
  });

  it('mediaSosial memakai link eksternal (iconUrl / wa.me), kembali ke beranda bila link kosong', () => {
    expect(
      getDetailUrl({ type: 'mediaSosial', id: 'm1', icon: 'instagram', iconUrl: 'https://www.instagram.com/ddarmasaba/' }),
    ).toBe('https://www.instagram.com/ddarmasaba/');
    expect(getDetailUrl({ type: 'mediaSosial', id: 'm2', icon: 'whatsapp', iconUrl: '0812-3456-7890' })).toBe(
      'https://wa.me/6281234567890',
    );
    expect(getDetailUrl({ type: 'mediaSosial', id: 'm3', icon: 'facebook', iconUrl: null })).toBe(HOME);
  });
});
