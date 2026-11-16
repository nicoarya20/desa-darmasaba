// @vitest-environment node
// Gotong Royong publik: kegiatan desa berkategori tetap Gotong Royong (disaring per id), URL daftar/detail, cari klien.
import { afterEach, describe, expect, it, vi } from 'vitest';

const loadKegiatanPage = vi.hoisted(() => vi.fn());
vi.mock('@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/kegiatan-list.source', () => ({ loadKegiatanPage }));
import type { KabarItem } from '@/app/(public)/_com/main-page/kabar-desa/kabar.logic';
import {
  gotongRoyongDetailHref,
  gotongRoyongListHref,
  searchGotongRoyong,
  toGotongRoyongItems,
} from '@/app/(public)/(pages)/lingkungan/gotong-royong/_com/gotong-royong.logic';
import { GOTONG_ROYONG_LIMIT } from '@/app/(public)/(pages)/lingkungan/gotong-royong/_com/gotong-royong.meta';
import { KATEGORI_GOTONG_ROYONG_ID } from '@/lib/kegiatan-gotong-royong';
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

  it('detail: kategori huruf kecil (ter-encode); kategori kosong/undefined → segmen "gotong-royong", bukan "undefined"', () => {
    expect(gotongRoyongDetailHref('Gotong Royong', 'k1')).toBe('/lingkungan/gotong-royong/gotong%20royong/k1');
    expect(gotongRoyongDetailHref(undefined, 'k2')).toBe('/lingkungan/gotong-royong/gotong-royong/k2');
    expect(gotongRoyongDetailHref('  ', 7)).toBe('/lingkungan/gotong-royong/gotong-royong/7');
  });
});

describe('toGotongRoyongItems', () => {
  it('buang duplikat id, tanggal terbaru dulu, href ke detail Gotong Royong (filter kategori sudah di API)', () => {
    const items = toGotongRoyongItems([
      item('a', 'Gotong Royong', '2022-05-26'),
      item('b', 'Gotong Royong', '2024-01-28'),
      item('a', 'Gotong Royong', '2022-05-26'),
      item('d', undefined, '2026-01-01'),
    ]);
    expect(items.map((i) => i.id)).toEqual(['d', 'b', 'a']);
    expect(items.map((i) => i.href)).toEqual([
      '/lingkungan/gotong-royong/gotong-royong/d',
      '/lingkungan/gotong-royong/gotong%20royong/b',
      '/lingkungan/gotong-royong/gotong%20royong/a',
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
  it('satu panggilan dengan id kategori tetap (tanpa nama kategori & cari), hasil dipetakan ke detail Gotong Royong', async () => {
    loadKegiatanPage.mockResolvedValue({ items: [item('a', 'Gotong Royong', '2022-05-26')], totalPages: 1 });
    const items = await loadGotongRoyongList();
    expect(loadKegiatanPage).toHaveBeenCalledTimes(1);
    expect(loadKegiatanPage).toHaveBeenCalledWith({ page: 1, limit: GOTONG_ROYONG_LIMIT, search: '', kategori: '' }, KATEGORI_GOTONG_ROYONG_ID);
    expect(items.map((i) => i.href)).toEqual(['/lingkungan/gotong-royong/gotong%20royong/a']);
  });

  it('galat API → Error berkonteks', async () => {
    loadKegiatanPage.mockRejectedValue(new Error('kegiatan desa gagal (HTTP 500)'));
    await expect(loadGotongRoyongList()).rejects.toThrow('Kegiatan Gotong Royong gagal dimuat: kegiatan desa gagal (HTTP 500)');
  });
});
