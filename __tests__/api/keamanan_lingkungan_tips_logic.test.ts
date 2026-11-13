// @vitest-environment node
// Keamanan Lingkungan & Tips Keamanan publik: pemetaan entri, URL daftar/detail, pemuat API.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const klGet = vi.fn();
const tipsGet = vi.fn();
vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      keamanan: {
        keamananlingkungan: { 'find-many': { get: klGet } },
        menutipskeamanan: { 'find-many': { get: tipsGet } },
      },
    },
  },
}));

const { hasHtmlContent, keamananLingkunganDetailHref, keamananLingkunganListHref, toKeamananLingkunganItem } =
  await import('@/app/(public)/(pages)/keamanan/keamanan-lingkungan-pecalang-patwal/_com/keamanan-lingkungan.logic');
const { loadKeamananLingkunganDetail, loadKeamananLingkunganPage } = await import(
  '@/app/(public)/(pages)/keamanan/keamanan-lingkungan-pecalang-patwal/_com/keamanan-lingkungan.source'
);
const { tipsKeamananListHref, tipsSearchable, toTip } = await import(
  '@/app/(public)/(pages)/keamanan/tips-keamanan/_com/tips-keamanan.logic'
);
const { loadTipsKeamananPage } = await import('@/app/(public)/(pages)/keamanan/tips-keamanan/_com/tips-keamanan.source');

// test-only: bentuk entri stg 2026-11-12 (dipangkas).
const entri = {
  id: 'cmkc2tcs00002vnt9c0ssj05n',
  name: ' Sosialisasi dan Pembinaan Keamanan Lingkungan Desa Darmasaba ',
  deskripsi: '<p>Pemerintah Desa&nbsp;Darmasaba melaksanakan <strong>sosialisasi</strong>.</p>',
  createdAt: '2026-04-14T07:38:56.519Z',
  image: { link: '/api/img/K0wY.webp' },
};
// test-only: deskripsi tips asli dari editor (`<p><ul>` bersarang + `<p></p>` kosong).
const tipsRumah = {
  id: 'cmkp70zau0002vnu9o1jtpi1i',
  judul: 'Keamanan Rumah ',
  deskripsi: '<p><ul><li><p>Pastikan pintu dan jendela selalu terkunci</p></li><li><p>Pasang lampu penerangan</p></li></ul></p>',
  image: null,
};

describe('hasHtmlContent', () => {
  it('teks atau gambar → berisi; kosong/tag kosong/spasi → tidak', () => {
    expect(hasHtmlContent('<p>Ada isi</p>')).toBe(true);
    expect(hasHtmlContent('<p><img src="/a.webp"></p>')).toBe(true);
    expect(hasHtmlContent('<p></p>')).toBe(false);
    expect(hasHtmlContent('<p>&nbsp;</p><p></p>')).toBe(false);
    expect(hasHtmlContent('')).toBe(false);
    expect(hasHtmlContent(null)).toBe(false);
    expect(hasHtmlContent(undefined)).toBe(false);
  });
});

describe('Keamanan Lingkungan: pemetaan & URL', () => {
  it('entri → kartu: judul dirapikan, ringkasan teks polos, foto, tautan detail', () => {
    expect(toKeamananLingkunganItem(entri)).toEqual({
      id: entri.id,
      title: 'Sosialisasi dan Pembinaan Keamanan Lingkungan Desa Darmasaba',
      summary: 'Pemerintah Desa Darmasaba melaksanakan sosialisasi.',
      imageUrl: '/api/img/K0wY.webp',
      createdAt: Date.parse('2026-04-14T07:38:56.519Z'),
      href: '/keamanan/keamanan-lingkungan-pecalang-patwal/cmkc2tcs00002vnt9c0ssj05n',
    });
  });

  it('tanpa gambar → imageUrl undefined (kartu memakai ikon, bukan "No image")', () => {
    expect(toKeamananLingkunganItem({ ...entri, image: null }).imageUrl).toBeUndefined();
    expect(toKeamananLingkunganItem({ ...entri, image: { link: '' } }).imageUrl).toBeUndefined();
  });

  it('URL daftar & detail', () => {
    expect(keamananLingkunganListHref()).toBe('/keamanan/keamanan-lingkungan-pecalang-patwal');
    expect(keamananLingkunganListHref({ search: ' pecalang ', page: 2 })).toBe(
      '/keamanan/keamanan-lingkungan-pecalang-patwal?search=pecalang&page=2',
    );
    expect(keamananLingkunganDetailHref('a b')).toBe('/keamanan/keamanan-lingkungan-pecalang-patwal/a%20b');
  });
});

describe('loadKeamananLingkunganPage', () => {
  beforeEach(() => klGet.mockReset());

  it('meneruskan page/limit/search ke API; totalPages dari respons', async () => {
    klGet.mockResolvedValue({ status: 200, data: { success: true, data: [entri], totalPages: 3 } });
    const res = await loadKeamananLingkunganPage({ page: 2, limit: 7, search: 'patwal', kategori: '' });
    expect(klGet).toHaveBeenCalledWith({ query: { page: 2, limit: 7, search: 'patwal' } });
    expect(res.totalPages).toBe(3);
    expect(res.items[0].title).toBe('Sosialisasi dan Pembinaan Keamanan Lingkungan Desa Darmasaba');
  });

  it('tanpa kata kunci → tanpa param search; totalPages 0/hilang → 1', async () => {
    klGet.mockResolvedValue({ status: 200, data: { success: true, data: [], totalPages: 0 } });
    await expect(loadKeamananLingkunganPage({ page: 1, limit: 7, search: '', kategori: '' })).resolves.toEqual({
      items: [],
      totalPages: 1,
    });
    expect(klGet).toHaveBeenCalledWith({ query: { page: 1, limit: 7 } });
  });

  it('respons gagal → Error berkonteks', async () => {
    klGet.mockResolvedValue({ status: 500, data: { success: false, message: 'DB mati' } });
    await expect(loadKeamananLingkunganPage({ page: 1, limit: 7, search: '', kategori: '' })).rejects.toThrow(
      'find-many keamanan lingkungan gagal (HTTP 500): DB mati',
    );
  });
});

describe('loadKeamananLingkunganDetail', () => {
  const fetchMock = vi.fn();
  const reply = (status: number, body: unknown) => ({ status, ok: status >= 200 && status < 300, json: async () => body });
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('200 → data; id di-encode', async () => {
    fetchMock.mockResolvedValue(reply(200, { success: true, data: entri }));
    await expect(loadKeamananLingkunganDetail('x y')).resolves.toEqual(entri);
    expect(fetchMock).toHaveBeenCalledWith('/api/keamanan/keamananlingkungan/x%20y');
  });

  it('404 → null; 500 / success:false → Error berkonteks', async () => {
    fetchMock.mockResolvedValue(reply(404, { success: false }));
    await expect(loadKeamananLingkunganDetail('nope')).resolves.toBeNull();
    fetchMock.mockResolvedValue(reply(500, { success: false }));
    await expect(loadKeamananLingkunganDetail('x')).rejects.toThrow('detail keamanan lingkungan x gagal (HTTP 500)');
    fetchMock.mockResolvedValue(reply(200, { success: false, message: 'aneh' }));
    await expect(loadKeamananLingkunganDetail('x')).rejects.toThrow('detail keamanan lingkungan x gagal: aneh');
  });
});

describe('Tips Keamanan: pemetaan & URL', () => {
  it('tips → judul dirapikan, HTML apa adanya, tanpa gambar → tanpa imageUrl', () => {
    expect(toTip(tipsRumah)).toEqual({
      id: tipsRumah.id,
      title: 'Keamanan Rumah',
      html: tipsRumah.deskripsi,
      imageUrl: undefined,
    });
  });

  it('isi kosong dari editor → html undefined; gambar ada → imageUrl', () => {
    const tip = toTip({ ...tipsRumah, deskripsi: '<p></p>', image: { link: '/api/img/tipu.webp' } });
    expect(tip.html).toBeUndefined();
    expect(tip.imageUrl).toBe('/api/img/tipu.webp');
  });

  it('URL daftar', () => {
    expect(tipsKeamananListHref()).toBe('/keamanan/tips-keamanan');
    expect(tipsKeamananListHref({ search: 'rumah', page: 1 })).toBe('/keamanan/tips-keamanan?search=rumah');
  });
});

describe('tipsSearchable', () => {
  it('tips ≤ ambang tanpa kata kunci → tersembunyi; > ambang → tampil', () => {
    expect(tipsSearchable('', 3, 6)).toBe(false);
    expect(tipsSearchable('', 6, 6)).toBe(false);
    expect(tipsSearchable('', 7, 6)).toBe(true);
  });

  it('URL membawa ?search= → selalu tampil (agar bisa dihapus), walau 0 hasil', () => {
    expect(tipsSearchable('rumah', 0, 6)).toBe(true);
    expect(tipsSearchable('rumah', null, 6)).toBe(true);
  });

  it('jumlah belum diketahui (memuat/galat) tanpa kata kunci → tersembunyi', () => {
    expect(tipsSearchable('', null, 6)).toBe(false);
  });
});

describe('loadTipsKeamananPage', () => {
  beforeEach(() => tipsGet.mockReset());

  it('meneruskan page/limit/search; tips dipetakan', async () => {
    tipsGet.mockResolvedValue({ status: 200, data: { success: true, data: [tipsRumah], totalPages: 2, total: 12 } });
    const res = await loadTipsKeamananPage({ page: 1, limit: 10, search: 'rumah' });
    expect(tipsGet).toHaveBeenCalledWith({ query: { page: 1, limit: 10, search: 'rumah' } });
    expect(res).toEqual({ tips: [toTip(tipsRumah)], totalPages: 2, total: 12 });
  });

  it('respons tanpa field total → total = jumlah tips di halaman ini', async () => {
    tipsGet.mockResolvedValue({ status: 200, data: { success: true, data: [tipsRumah, tipsRumah] } });
    await expect(loadTipsKeamananPage({ page: 1, limit: 10, search: '' })).resolves.toMatchObject({ total: 2 });
  });

  it('respons gagal → Error berkonteks', async () => {
    tipsGet.mockResolvedValue({ status: 200, data: { success: false, message: 'x' } });
    await expect(loadTipsKeamananPage({ page: 1, limit: 10, search: '' })).rejects.toThrow(
      'find-many tips keamanan gagal (HTTP 200): x',
    );
  });
});
