// @vitest-environment node
// Halaman Program Kesehatan (/kesehatan/program-kesehatan): penyaring indikator, paginasi klien, pemuat API.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const programGet = vi.fn();
vi.mock('@/lib/api-fetch', () => ({
  default: { api: { kesehatan: { programkesehatan: { 'find-many': { get: programGet } } } } },
}));

const { formatPersen, isIndikator, programDetailHref, programListHref, toKegiatanList, toProgramItem } =
  await import('@/app/(public)/(pages)/kesehatan/program-kesehatan/_com/program.logic');
const { paginate } = await import('@/app/(public)/_com/kabar-list/kabar-list.logic');
const { loadProgramDetail, loadProgramKesehatan } = await import(
  '@/app/(public)/(pages)/kesehatan/program-kesehatan/_com/program.source'
);
const { PROGRAM_FETCH_LIMIT } = await import('@/app/(public)/(pages)/kesehatan/program-kesehatan/_com/program.meta');

// test-only: bentuk entri stg 2026-11-12 (dipangkas).
const kegiatan = {
  id: 'cmkawnr9k0008vn6ymwv0eqkx',
  name: ' Posyandu Pudak Amara Berkompetisi ',
  deskripsiSingkat: '<p>Partisipasi Posyandu Pudak Amara dalam lomba&nbsp;prestasi.</p>',
  deskripsi: '<p>Isi lengkap</p>',
  persentase: 0,
  createdAt: '2026-04-14T07:38:56.375Z',
  updatedAt: '2026-05-05T09:30:20.570Z',
  image: { link: '/api/img/pudak.webp' },
};
// test-only
const indikator = (id: string, name: string, persentase: number, updatedAt: string) => ({
  id,
  name,
  deskripsiSingkat: `<p>Persentase ${name.toLowerCase()}.</p>`,
  deskripsi: '<p>Penjelasan</p>',
  persentase,
  createdAt: '2026-05-05T09:30:23.225Z',
  updatedAt,
  image: null,
});

describe('isIndikator', () => {
  it('persentase > 0 dan tanpa foto → indikator (tidak bergantung nama)', () => {
    expect(isIndikator({ persentase: 92, image: null })).toBe(true);
    expect(isIndikator({ persentase: 14 })).toBe(true);
    expect(isIndikator({ persentase: 50, image: { link: '' } })).toBe(true);
  });

  it('kegiatan buatan admin (persentase 0/null, atau berfoto) → bukan indikator', () => {
    expect(isIndikator({ persentase: 0, image: null })).toBe(false);
    expect(isIndikator({ persentase: null, image: null })).toBe(false);
    expect(isIndikator({ image: null })).toBe(false);
    expect(isIndikator({ persentase: 80, image: { link: '/api/img/a.webp' } })).toBe(false);
    expect(isIndikator({ persentase: Number.NaN, image: null })).toBe(false);
  });
});

describe('toKegiatanList', () => {
  it('indikator disaring keluar (tidak jadi kartu tanpa foto); urutan API dipertahankan', () => {
    const items = toKegiatanList([
      indikator('stunting', 'Target Stunting', 14, '2026-11-02T06:30:12.000Z'),
      kegiatan,
      indikator('gizi', 'Gizi Baik', 86, '2026-11-03T01:00:00.000Z'),
      { ...kegiatan, id: 'k-tanpa-foto', image: null },
    ]);
    expect(items.map((k) => k.id)).toEqual(['cmkawnr9k0008vn6ymwv0eqkx', 'k-tanpa-foto']);
  });

  it('hanya indikator → daftar kosong', () => {
    expect(toKegiatanList([indikator('gizi', 'Gizi Baik', 86, '2026-11-03T01:00:00.000Z')])).toEqual([]);
  });
});

describe('toProgramItem', () => {
  it('judul dirapikan, ringkasan HTML → teks, tanpa kategori/penulis', () => {
    expect(toProgramItem(kegiatan)).toEqual({
      id: 'cmkawnr9k0008vn6ymwv0eqkx',
      title: 'Posyandu Pudak Amara Berkompetisi',
      summary: 'Partisipasi Posyandu Pudak Amara dalam lomba prestasi.',
      imageUrl: '/api/img/pudak.webp',
      createdAt: Date.parse('2026-04-14T07:38:56.375Z'),
      href: '/kesehatan/program-kesehatan/cmkawnr9k0008vn6ymwv0eqkx',
    });
  });
});

describe('URL', () => {
  it('daftar: cari & halaman ditulis hanya bila perlu; detail: id di-encode', () => {
    expect(programListHref()).toBe('/kesehatan/program-kesehatan');
    expect(programListHref({ search: ' gizi ', page: 2 })).toBe('/kesehatan/program-kesehatan?search=gizi&page=2');
    expect(programListHref({ page: 1 })).toBe('/kesehatan/program-kesehatan');
    expect(programDetailHref('a/b')).toBe('/kesehatan/program-kesehatan/a%2Fb');
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 15 }, (_, i) => i + 1);

  it('7 per halaman: 3 halaman, halaman terakhir berisi sisa', () => {
    expect(paginate(items, 1, 7)).toEqual({ items: [1, 2, 3, 4, 5, 6, 7], page: 1, totalPages: 3 });
    expect(paginate(items, 3, 7)).toEqual({ items: [15], page: 3, totalPages: 3 });
  });

  it('halaman di luar jangkauan → halaman terakhir; daftar kosong tetap 1 halaman', () => {
    expect(paginate(items, 99, 7).page).toBe(3);
    expect(paginate([], 4, 7)).toEqual({ items: [], page: 1, totalPages: 1 });
  });
});

describe('formatPersen', () => {
  it('format Indonesia', () => {
    expect(formatPersen(92)).toBe('92%');
    expect(formatPersen(8.5)).toBe('8,5%');
  });
});

describe('loadProgramKesehatan', () => {
  beforeEach(() => programGet.mockReset());

  it('satu permintaan page 1 + batas muat; kata kunci diteruskan ke API', async () => {
    programGet.mockResolvedValue({ status: 200, data: { success: true, data: [kegiatan], total: 1 } });
    await expect(loadProgramKesehatan('gizi')).resolves.toEqual([kegiatan]);
    expect(programGet).toHaveBeenCalledWith({ query: { page: 1, limit: PROGRAM_FETCH_LIMIT, search: 'gizi' } });
  });

  it('tanpa kata kunci → tanpa param search', async () => {
    programGet.mockResolvedValue({ status: 200, data: { success: true, data: [] } });
    await loadProgramKesehatan('');
    expect(programGet).toHaveBeenCalledWith({ query: { page: 1, limit: PROGRAM_FETCH_LIMIT } });
  });

  it('entri melebihi batas → peringatan (sisa tidak tampil)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    programGet.mockResolvedValue({ status: 200, data: { success: true, data: [kegiatan], total: 140 } });
    await loadProgramKesehatan('');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('140 entri'));
    warn.mockRestore();
  });

  it('API gagal → Error berkonteks', async () => {
    programGet.mockResolvedValue({ status: 200, data: { success: false, message: 'Gagal mengambil data' } });
    await expect(loadProgramKesehatan('')).rejects.toThrow('find-many program kesehatan gagal (HTTP 200): Gagal mengambil data');
  });
});

describe('loadProgramDetail', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  const reply = (status: number, body: unknown) => ({ ok: status < 400, status, json: async () => body });

  it('200 → data', async () => {
    fetchMock.mockResolvedValue(reply(200, { success: true, data: kegiatan }));
    await expect(loadProgramDetail('x y')).resolves.toEqual(kegiatan);
    expect(fetchMock).toHaveBeenCalledWith('/api/kesehatan/programkesehatan/x%20y');
  });

  it('404 → null (tidak ditemukan); 500 → Error', async () => {
    fetchMock.mockResolvedValue(reply(404, { success: false, message: 'Data tidak ditemukan' }));
    await expect(loadProgramDetail('nope')).resolves.toBeNull();
    fetchMock.mockResolvedValue(reply(500, { success: false }));
    await expect(loadProgramDetail('boom')).rejects.toThrow('detail program kesehatan boom gagal (HTTP 500)');
  });
});
