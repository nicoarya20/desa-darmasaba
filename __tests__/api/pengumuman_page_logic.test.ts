// @vitest-environment node
// Halaman Pengumuman publik: URL daftar (kategori/cari/halaman), pil kategori, pemuat daftar & detail.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const pengumumanGet = vi.fn();
vi.mock('@/lib/api-fetch', () => ({
  default: { api: { desa: { pengumuman: { 'find-many': { get: pengumumanGet } } } } },
}));

const { activeKategori, kategoriTerlihat, labelKategori, pengumumanListHref, samaKategori } = await import(
  '@/app/darmasaba/(pages)/pemerintahan/pengumuman/_com/pengumuman-list.logic'
);
const { loadPengumumanPage } = await import('@/app/darmasaba/(pages)/pemerintahan/pengumuman/_com/pengumuman-list.source');
const { loadPengumumanDetail } = await import(
  '@/app/darmasaba/(pages)/pemerintahan/pengumuman/_com/detail/pengumuman-detail.source'
);
const { withListQuery } = await import('@/app/darmasaba/_com/kabar-list/kabar-list.logic');
const { toPengumumanItem } = await import('@/app/darmasaba/_com/main-page/kabar-desa/kabar.logic');

const BASE = '/darmasaba/pemerintahan/pengumuman';

describe('withListQuery', () => {
  it('cari di-trim, halaman > 1 ditulis; kosong & halaman 1 tidak', () => {
    expect(withListQuery('/x')).toBe('/x');
    expect(withListQuery('/x', { search: '  ', page: 1 })).toBe('/x');
    expect(withListQuery('/x', { search: ' irigasi subak ', page: 3 })).toBe('/x?search=irigasi+subak&page=3');
  });
});

describe('pengumumanListHref', () => {
  it('semua = /pengumuman, kategori = nama asli di-encode', () => {
    expect(pengumumanListHref('')).toBe(BASE);
    expect(pengumumanListHref('Lelang & Pengadaan', { page: 2 })).toBe(`${BASE}/Lelang%20%26%20Pengadaan?page=2`);
    expect(pengumumanListHref('', { search: 'lelang' })).toBe(`${BASE}?search=lelang`);
  });
});

describe('activeKategori', () => {
  it('segmen setelah "pengumuman" di-decode; halaman semua → kosong', () => {
    expect(activeKategori(BASE)).toBe('');
    expect(activeKategori(`${BASE}/Lelang%20%26%20Pengadaan`)).toBe('Lelang & Pengadaan');
    expect(activeKategori(`${BASE}/Lelang & Pengadaan`)).toBe('Lelang & Pengadaan');
    expect(activeKategori(`${BASE}/100%`)).toBe('100%');
    expect(activeKategori('/darmasaba/lain')).toBe('');
  });
});

describe('pil kategori', () => {
  const list = [
    { name: 'Lelang & Pengadaan', count: 47 },
    { name: 'Adat & Budaya', count: 0 },
    { name: 'Digitalisasi Desa', count: 2 },
  ];

  it('kategori kosong disembunyikan kecuali sedang aktif (case-insensitive)', () => {
    expect(kategoriTerlihat(list, '').map((k) => k.name)).toEqual(['Lelang & Pengadaan', 'Digitalisasi Desa']);
    expect(kategoriTerlihat(list, 'adat & budaya').map((k) => k.name)).toEqual([
      'Lelang & Pengadaan',
      'Adat & Budaya',
      'Digitalisasi Desa',
    ]);
  });

  it('label memakai ejaan data bila dikenal', () => {
    expect(samaKategori(' Digitalisasi desa', 'digitalisasi DESA')).toBe(true);
    expect(labelKategori('lelang & pengadaan', list)).toBe('Lelang & Pengadaan');
    expect(labelKategori('tak dikenal', list)).toBe('tak dikenal');
  });
});

describe('toPengumumanItem', () => {
  it('gambar utama jadi imageUrl; tanpa gambar → undefined', () => {
    const base = { id: 'p1', judul: ' Lelang ', createdAt: '2026-11-10T00:00:00.000Z' };
    expect(toPengumumanItem({ ...base, image: { link: '/api/img/a.webp' } }).imageUrl).toBe('/api/img/a.webp');
    expect(toPengumumanItem({ ...base, image: null }).imageUrl).toBeUndefined();
    expect(toPengumumanItem(base).title).toBe('Lelang');
  });
});

describe('loadPengumumanPage', () => {
  beforeEach(() => pengumumanGet.mockReset());

  it('kirim filter yang terisi saja dan petakan item + totalPages', async () => {
    pengumumanGet.mockResolvedValue({
      status: 200,
      data: {
        success: true,
        totalPages: 6,
        data: [{ id: 'a', judul: 'A', createdAt: '2026-11-01', CategoryPengumuman: { name: 'Lelang & Pengadaan' } }],
      },
    });
    const res = await loadPengumumanPage({ page: 2, limit: 10, search: 'irigasi', kategori: 'Lelang & Pengadaan' });
    expect(pengumumanGet).toHaveBeenCalledWith({
      query: { page: 2, limit: 10, search: 'irigasi', kategori: 'Lelang & Pengadaan' },
    });
    expect(res.totalPages).toBe(6);
    expect(res.items[0].href).toBe(`${BASE}/Lelang%20%26%20Pengadaan/a`);

    await loadPengumumanPage({ page: 1, limit: 10, search: '', kategori: '' });
    expect(pengumumanGet).toHaveBeenLastCalledWith({ query: { page: 1, limit: 10 } });
  });

  it('respons gagal → Error berkonteks', async () => {
    pengumumanGet.mockResolvedValue({ status: 200, data: { success: false, message: 'db down' } });
    await expect(loadPengumumanPage({ page: 1, limit: 10, search: '', kategori: '' })).rejects.toThrow(
      /pengumuman.*db down/,
    );
  });
});

describe('loadPengumumanDetail', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  const reply = (status: number, body: unknown) => ({ ok: status < 400, status, json: async () => body });

  it('sukses → data; id di-encode', async () => {
    fetchMock.mockResolvedValue(reply(200, { success: true, data: { id: 'a/b', judul: 'X' } }));
    expect(await loadPengumumanDetail('a/b')).toMatchObject({ judul: 'X' });
    expect(fetchMock).toHaveBeenCalledWith('/api/desa/pengumuman/a%2Fb');
  });

  it('handler membalas status 404 → null (tidak ditemukan)', async () => {
    fetchMock.mockResolvedValue(reply(200, { status: 404, body: 'Pengumuman tidak ditemukan' }));
    expect(await loadPengumumanDetail('x')).toBeNull();
  });

  it('HTTP gagal atau respons aneh → Error', async () => {
    fetchMock.mockResolvedValue(reply(500, null));
    await expect(loadPengumumanDetail('x')).rejects.toThrow(/HTTP 500/);
    fetchMock.mockResolvedValue(reply(200, { success: false, message: 'rusak' }));
    await expect(loadPengumumanDetail('x')).rejects.toThrow(/rusak/);
  });
});
