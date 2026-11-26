// @vitest-environment node
// Pil kategori KabarListHeader: pil yang hanya mengganti query (?kategori=, ?tahun=) memakai next/link tanpa animasi
// pindah halaman (tidak berkedip); pil yang mengganti path (Berita /pemerintahan/berita/<kategori>) tetap transisi.
import { describe, expect, it } from 'vitest';
import { isQueryOnlyHref } from '@/app/(public)/_com/kabar-list/kabar-list.logic';

describe('isQueryOnlyHref', () => {
  it('path sama, query beda → true (Produk Hukum ?kategori=, Kolaborasi ?tahun=)', () => {
    expect(isQueryOnlyHref('/pemerintahan/produk-hukum', '/pemerintahan/produk-hukum?kategori=perdes')).toBe(true);
    expect(isQueryOnlyHref('/inovasi/kolaborasi-inovasi', '/inovasi/kolaborasi-inovasi?tahun=2025&search=x')).toBe(true);
    expect(isQueryOnlyHref('/inovasi/inovasi-teknologi-desa', '/inovasi/inovasi-teknologi-desa')).toBe(true);
  });

  it('href relatif query-saja dan beda garis miring akhir → true', () => {
    expect(isQueryOnlyHref('/pemerintahan/produk-hukum', '?kategori=perbup')).toBe(true);
    expect(isQueryOnlyHref('/pemerintahan/produk-hukum/', '/pemerintahan/produk-hukum?kategori=a')).toBe(true);
  });

  it('path berganti (kategori Berita/Kegiatan sebagai segmen) → false', () => {
    expect(isQueryOnlyHref('/pemerintahan/berita/semua', '/pemerintahan/berita/pendidikan')).toBe(false);
    expect(isQueryOnlyHref('/pemerintahan/kegiatan-desa/semua', '/pemerintahan/kegiatan-desa/pkk%20%26%20pemberdayaan')).toBe(false);
  });

  it('pathname belum diketahui atau tautan eksternal → false (tetap tautan transisi)', () => {
    expect(isQueryOnlyHref(null, '/pemerintahan/produk-hukum?kategori=a')).toBe(false);
    expect(isQueryOnlyHref('', '?kategori=a')).toBe(false);
    expect(isQueryOnlyHref('/pemerintahan/produk-hukum', 'https://contoh.go.id/pemerintahan/produk-hukum')).toBe(false);
  });
});
