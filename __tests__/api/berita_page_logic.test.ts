// @vitest-environment node
// Halaman daftar berita (/darmasaba/pemerintahan/berita/*): URL kategori/cari/halaman + pemuat find-many.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const beritaGet = vi.fn();
vi.mock('@/lib/api-fetch', () => ({
  default: { api: { desa: { berita: { 'find-many': { get: beritaGet } } } } },
}));

const { activeSlug, beritaListHref, kategoriLabel, kategoriSlug } = await import(
  '@/app/darmasaba/(pages)/pemerintahan/berita/_com/berita-list.logic'
);
const { parsePage } = await import('@/app/darmasaba/_com/kabar-list/kabar-list.logic');
const { loadBeritaPage } = await import('@/app/darmasaba/(pages)/pemerintahan/berita/_com/berita-list.source');

describe('parsePage', () => {
  it('bilangan bulat positif dipakai, selain itu → 1', () => {
    expect(parsePage('3')).toBe(3);
    expect(parsePage(null)).toBe(1);
    expect(parsePage('0')).toBe(1);
    expect(parsePage('-2')).toBe(1);
    expect(parsePage('1.5')).toBe(1);
    expect(parsePage('abc')).toBe(1);
  });
});

describe('beritaListHref', () => {
  it('halaman 1 dan cari kosong tidak ditulis ke query', () => {
    expect(beritaListHref('semua')).toBe('/darmasaba/pemerintahan/berita/semua');
    expect(beritaListHref('budaya', { search: '   ', page: 1 })).toBe('/darmasaba/pemerintahan/berita/budaya');
  });

  it('cari di-trim, halaman > 1 ditulis, slug di-encode', () => {
    expect(beritaListHref('semua', { search: ' festival desa ', page: 2 })).toBe(
      '/darmasaba/pemerintahan/berita/semua?search=festival+desa&page=2',
    );
    expect(beritaListHref('seni & budaya')).toBe('/darmasaba/pemerintahan/berita/seni%20%26%20budaya');
  });
});

describe('activeSlug / kategoriSlug / kategoriLabel', () => {
  it('slug = segmen terakhir pathname, di-decode dan huruf kecil', () => {
    expect(activeSlug('/darmasaba/pemerintahan/berita/semua')).toBe('semua');
    expect(activeSlug('/darmasaba/pemerintahan/berita/Budaya')).toBe('budaya');
    expect(activeSlug('/darmasaba/pemerintahan/berita/seni%20%26%20budaya')).toBe('seni & budaya');
  });

  it('segmen % rusak tidak melempar galat', () => {
    expect(activeSlug('/darmasaba/pemerintahan/berita/100%')).toBe('100%');
  });

  it('nama kategori → slug huruf kecil; slug → nama asli untuk ditampilkan', () => {
    expect(kategoriSlug(' Pemerintahan ')).toBe('pemerintahan');
    expect(kategoriLabel('teknologi', ['Budaya', 'Teknologi'])).toBe('Teknologi');
    expect(kategoriLabel('tak-dikenal', ['Budaya'])).toBe('tak-dikenal');
  });
});

describe('loadBeritaPage', () => {
  beforeEach(() => beritaGet.mockReset());

  // test-only: satu item respons find-many berita.
  const row = { id: 'b1', judul: 'Festival', deskripsi: '<p>Ringkas</p>', createdAt: '2026-11-03T02:00:00Z', image: null, kategoriBerita: { name: 'Budaya' } };

  it('mengirim page/limit, cari & kategori hanya bila ada; item dinormalisasi + totalPages', async () => {
    beritaGet.mockResolvedValue({ status: 200, data: { success: true, data: [row], totalPages: 3 } });
    const res = await loadBeritaPage({ page: 2, limit: 7, search: 'festival', kategori: 'budaya' });
    expect(beritaGet).toHaveBeenCalledWith({ query: { page: 2, limit: 7, search: 'festival', kategori: 'budaya' } });
    expect(res.totalPages).toBe(3);
    expect(res.items[0]).toMatchObject({ id: 'b1', title: 'Festival', summary: 'Ringkas', kategori: 'Budaya', href: '/darmasaba/pemerintahan/berita/Budaya/b1' });

    await loadBeritaPage({ page: 1, limit: 7, search: '', kategori: '' });
    expect(beritaGet).toHaveBeenLastCalledWith({ query: { page: 1, limit: 7 } });
  });

  it('totalPages hilang/0 → 1', async () => {
    beritaGet.mockResolvedValue({ status: 200, data: { success: true, data: [], totalPages: 0 } });
    expect((await loadBeritaPage({ page: 1, limit: 7, search: '', kategori: '' })).totalPages).toBe(1);
  });

  it('respons gagal → Error berkonteks (bukan daftar kosong diam-diam)', async () => {
    beritaGet.mockResolvedValue({ status: 500, data: { success: false, message: 'db down' } });
    await expect(loadBeritaPage({ page: 1, limit: 7, search: '', kategori: '' })).rejects.toThrow(/berita.*500.*db down/);
  });
});
