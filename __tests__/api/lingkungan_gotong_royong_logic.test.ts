// @vitest-environment node
// Gotong Royong publik: gabung kategori Lingkungan + Kebersihan dari tabel kegiatan desa, URL daftar/detail, cari klien.
import { afterEach, describe, expect, it, vi } from 'vitest';

const loadKegiatanPage = vi.hoisted(() => vi.fn());
vi.mock('@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/kegiatan-list.source', () => ({ loadKegiatanPage }));
import type { KabarItem } from '@/app/(public)/_com/main-page/kabar-desa/kabar.logic';
import {
  gotongRoyongDetailHref,
  gotongRoyongListHref,
  isGotongRoyongKategori,
  searchGotongRoyong,
  toGotongRoyongItems,
} from '@/app/(public)/(pages)/lingkungan/gotong-royong/_com/gotong-royong.logic';
import {
  GOTONG_ROYONG_KATEGORI,
  GOTONG_ROYONG_KATEGORI_LIMIT,
} from '@/app/(public)/(pages)/lingkungan/gotong-royong/_com/gotong-royong.meta';
import { loadGotongRoyongList } from '@/app/(public)/(pages)/lingkungan/gotong-royong/_com/gotong-royong.source';

// test-only: kartu hasil toKegiatanItem (href masih milik Kegiatan Desa).
const item = (id: string, kategori: string | undefined, tanggal: string, over: Partial<KabarItem> = {}): KabarItem => ({
  id,
  title: `Kegiatan ${id}`,
  summary: 'Gotong royong di Pura Dalem Kangin',
  kategori,
  createdAt: Date.parse(tanggal),
  href: `/pemerintahan/kegiatan-desa/${kategori?.toLowerCase()}/${id}`,
  ...over,
});

afterEach(() => loadKegiatanPage.mockReset());

describe('URL Gotong Royong', () => {
  it('daftar: halaman 1 dan cari kosong tidak ditulis; cari di-trim, halaman > 1 ditulis', () => {
    expect(gotongRoyongListHref()).toBe('/lingkungan/gotong-royong');
    expect(gotongRoyongListHref({ search: '  ', page: 1 })).toBe('/lingkungan/gotong-royong');
    expect(gotongRoyongListHref({ search: ' pura ', page: 2 })).toBe('/lingkungan/gotong-royong?search=pura&page=2');
  });

  it('detail: kategori huruf kecil; kategori kosong/undefined → segmen "lingkungan", bukan "undefined"', () => {
    expect(gotongRoyongDetailHref('Kebersihan', 'k1')).toBe('/lingkungan/gotong-royong/kebersihan/k1');
    expect(gotongRoyongDetailHref(undefined, 'k2')).toBe('/lingkungan/gotong-royong/lingkungan/k2');
    expect(gotongRoyongDetailHref('  ', 7)).toBe('/lingkungan/gotong-royong/lingkungan/7');
  });
});

describe('isGotongRoyongKategori', () => {
  it('hanya Lingkungan & Kebersihan, persis tanpa beda huruf besar', () => {
    expect(isGotongRoyongKategori('Lingkungan')).toBe(true);
    expect(isGotongRoyongKategori(' kebersihan ')).toBe(true);
    expect(isGotongRoyongKategori('Lingkungan Hidup')).toBe(false);
    expect(isGotongRoyongKategori('Sosial')).toBe(false);
    expect(isGotongRoyongKategori(undefined)).toBe(false);
  });
});

describe('toGotongRoyongItems', () => {
  it('saring kategori lain, buang duplikat id, tanggal terbaru dulu, href ke detail Gotong Royong', () => {
    const items = toGotongRoyongItems([
      item('a', 'Lingkungan', '2022-05-26'),
      item('b', 'Kebersihan', '2024-01-28'),
      item('c', 'Lingkungan Hidup', '2025-01-01'),
      item('a', 'Lingkungan', '2022-05-26'),
      item('d', undefined, '2026-01-01'),
      item('e', 'Lingkungan', '2023-11-17'),
    ]);
    expect(items.map((i) => i.id)).toEqual(['b', 'e', 'a']);
    expect(items.map((i) => i.href)).toEqual([
      '/lingkungan/gotong-royong/kebersihan/b',
      '/lingkungan/gotong-royong/lingkungan/e',
      '/lingkungan/gotong-royong/lingkungan/a',
    ]);
  });
});

describe('searchGotongRoyong', () => {
  const items = [
    item('a', 'Lingkungan', '2022-05-26', { title: 'Mareresik Pura Desa' }),
    item('b', 'Kebersihan', '2024-01-28', { title: 'Bersih Pantai', summary: 'Pungut sampah plastik' }),
  ];

  it('kata kunci kosong → semua; cocok judul/ringkasan/kategori tanpa beda huruf besar', () => {
    expect(searchGotongRoyong(items, ' ')).toHaveLength(2);
    expect(searchGotongRoyong(items, 'PURA').map((i) => i.id)).toEqual(['a']);
    expect(searchGotongRoyong(items, 'plastik').map((i) => i.id)).toEqual(['b']);
    expect(searchGotongRoyong(items, 'kebersihan').map((i) => i.id)).toEqual(['b']);
    expect(searchGotongRoyong(items, 'olahraga')).toEqual([]);
  });
});

describe('loadGotongRoyongList', () => {
  it('satu panggilan per kategori (limit per kategori, tanpa cari), hasil digabung', async () => {
    loadKegiatanPage.mockImplementation(async ({ kategori }: { kategori: string }) => ({
      items: kategori === 'Lingkungan' ? [item('a', 'Lingkungan', '2022-05-26')] : [item('b', 'Kebersihan', '2024-01-28')],
      totalPages: 1,
    }));
    const items = await loadGotongRoyongList();
    expect(loadKegiatanPage.mock.calls.map(([q]) => q)).toEqual(
      GOTONG_ROYONG_KATEGORI.map((kategori) => ({ page: 1, limit: GOTONG_ROYONG_KATEGORI_LIMIT, search: '', kategori })),
    );
    expect(items.map((i) => i.id)).toEqual(['b', 'a']);
  });

  it('galat salah satu kategori → Error berkonteks nama kategori', async () => {
    loadKegiatanPage.mockImplementation(async ({ kategori }: { kategori: string }) => {
      if (kategori === 'Kebersihan') throw new Error('kegiatan desa gagal (HTTP 500)');
      return { items: [], totalPages: 1 };
    });
    await expect(loadGotongRoyongList()).rejects.toThrow('Gotong royong kategori Kebersihan gagal dimuat: kegiatan desa gagal (HTTP 500)');
  });
});
