// @vitest-environment node
// Halaman Kegiatan Desa (/pemerintahan/kegiatan-desa/*): URL daftar/detail, normalisasi kartu, pemuat API.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const kegiatanGet = vi.fn();
vi.mock('@/lib/api-fetch', () => ({
  default: { api: { desa: { kegiatandesa: { 'find-many': { get: kegiatanGet } } } } },
}));

const { kegiatanDetailHref, kegiatanListHref, toKegiatanItem } = await import(
  '@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/kegiatan-list.logic'
);
const { loadKegiatanPage } = await import('@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/kegiatan-list.source');
const { loadKegiatanDetail } = await import(
  '@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/detail/kegiatan-detail.source'
);

// test-only: item find-many dari stg (dipangkas).
const apiItem = {
  id: 'k1',
  judul: '  Mareresik (Gotong Royong) ',
  deskripsiSingkat: 'Kegiatan <b>mareresik</b> di lingkungan desa',
  tanggal: '2023-11-17T00:00:00.000Z',
  image: { link: '/api/img/k1.webp' },
  kategoriKegiatan: { nama: 'PKK & Pemberdayaan Perempuan' },
};

describe('kegiatanListHref', () => {
  it('/semua tetap jadi URL navbar; halaman 1 dan cari kosong tidak ditulis', () => {
    expect(kegiatanListHref('semua')).toBe('/pemerintahan/kegiatan-desa/semua');
    expect(kegiatanListHref('semua', { search: '  ', page: 1 })).toBe('/pemerintahan/kegiatan-desa/semua');
  });

  it('slug kategori di-encode, cari di-trim, halaman > 1 ditulis', () => {
    expect(kegiatanListHref('pkk & pemberdayaan perempuan', { search: ' pura ', page: 2 })).toBe(
      '/pemerintahan/kegiatan-desa/pkk%20%26%20pemberdayaan%20perempuan?search=pura&page=2',
    );
  });
});

describe('kegiatanDetailHref', () => {
  it('segmen kategori huruf kecil (sama dengan tautan lama & Monev), tanpa kategori → pengganti', () => {
    expect(kegiatanDetailHref('Pembangunan', 'x')).toBe('/pemerintahan/kegiatan-desa/pembangunan/x');
    expect(kegiatanDetailHref(' Sosial ', 'x')).toBe('/pemerintahan/kegiatan-desa/sosial/x');
    expect(kegiatanDetailHref(null, 'x')).toBe('/pemerintahan/kegiatan-desa/umum/x');
  });
});

describe('toKegiatanItem', () => {
  it('judul di-trim, ringkasan teks polos, label = nama kategori, tanggal = tanggal pelaksanaan', () => {
    expect(toKegiatanItem(apiItem)).toEqual({
      id: 'k1',
      title: 'Mareresik (Gotong Royong)',
      summary: 'Kegiatan mareresik di lingkungan desa',
      kategori: 'PKK & Pemberdayaan Perempuan',
      imageUrl: '/api/img/k1.webp',
      createdAt: Date.UTC(2023, 10, 17),
      href: '/pemerintahan/kegiatan-desa/pkk%20%26%20pemberdayaan%20perempuan/k1',
    });
  });

  it('tanpa gambar/kategori/ringkasan → field opsional kosong', () => {
    const item = toKegiatanItem({ id: 'k2', judul: 'Rapat', tanggal: '2024-01-28T00:00:00.000Z', image: null, kategoriKegiatan: null });
    expect(item.imageUrl).toBeUndefined();
    expect(item.kategori).toBeUndefined();
    expect(item.summary).toBe('');
  });
});

describe('loadKegiatanPage', () => {
  beforeEach(() => kegiatanGet.mockReset());

  it('mengirim page/limit + filter yang terisi saja, menormalkan item & totalPages', async () => {
    kegiatanGet.mockResolvedValue({ status: 200, data: { success: true, data: [apiItem], totalPages: 3 } });
    const res = await loadKegiatanPage({ page: 2, limit: 7, search: 'pura', kategori: 'lingkungan' });
    expect(kegiatanGet).toHaveBeenCalledWith({ query: { page: 2, limit: 7, search: 'pura', kategori: 'lingkungan' } });
    expect(res.totalPages).toBe(3);
    expect(res.items[0].title).toBe('Mareresik (Gotong Royong)');

    await loadKegiatanPage({ page: 1, limit: 7, search: '', kategori: '' });
    expect(kegiatanGet).toHaveBeenLastCalledWith({ query: { page: 1, limit: 7 } });
  });

  it('totalPages 0 (kategori kosong) → 1; respons gagal → Error berkonteks', async () => {
    kegiatanGet.mockResolvedValue({ status: 200, data: { success: true, data: [], totalPages: 0 } });
    expect((await loadKegiatanPage({ page: 1, limit: 7, search: '', kategori: 'sosial' })).totalPages).toBe(1);

    kegiatanGet.mockResolvedValue({ status: 200, data: { success: false, message: 'Gagal mengambil data kegiatan desa' } });
    await expect(loadKegiatanPage({ page: 1, limit: 7, search: '', kategori: '' })).rejects.toThrow(
      /kegiatan desa gagal \(HTTP 200\): Gagal mengambil data kegiatan desa/,
    );
  });
});

describe('loadKegiatanDetail', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  const reply = (body: unknown, ok = true, status = 200) =>
    fetchMock.mockResolvedValue({ ok, status, json: async () => body });

  it('sukses → data; id di-encode di URL', async () => {
    reply({ success: true, data: { id: 'a b', judul: 'X', tanggal: '2024-01-28T00:00:00.000Z' } });
    expect((await loadKegiatanDetail('a b'))?.judul).toBe('X');
    expect(fetchMock).toHaveBeenCalledWith('/api/desa/kegiatandesa/a%20b');
  });

  it('"Data tidak ditemukan" → null (bukan galat)', async () => {
    reply({ success: false, message: 'Data tidak ditemukan' });
    expect(await loadKegiatanDetail('x')).toBeNull();
  });

  it('galat DB (HTTP 200 success:false) dan HTTP gagal → Error berkonteks', async () => {
    reply({ success: false, message: 'Gagal mengambil data kegiatan desa' });
    await expect(loadKegiatanDetail('x')).rejects.toThrow('detail kegiatan x gagal: Gagal mengambil data kegiatan desa');
    reply(null, false, 500);
    await expect(loadKegiatanDetail('x')).rejects.toThrow('detail kegiatan x gagal (HTTP 500)');
  });
});
