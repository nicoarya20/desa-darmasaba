// @vitest-environment node
// Sumber data publik Info Sekolah: URL & parameter API, galat dilempar (bukan angka 0), dan halaman publik
// tidak pernah meminta daftar siswa (nama anak).
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  loadInfoSekolah,
  loadJenjangNames,
  loadPengajarPage,
} from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/info-sekolah.source';

type Reply = { status?: number; body: unknown };

function mockFetch(routes: Record<string, Reply>) {
  const calls: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      calls.push(url);
      const key = Object.keys(routes).find((k) => url.includes(k));
      const reply = key ? routes[key] : { status: 404, body: { success: false, message: 'not found' } };
      return new Response(JSON.stringify(reply.body), { status: reply.status ?? 200 });
    }),
  );
  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// test-only: respons minimal.
const STATS = { success: true, data: { perJenjang: [{ nama: 'SD', jumlahSiswa: 70, jumlahPengajar: 70 }], jumlahLembaga: 1, jumlahPengajar: 70 } };
const LEMBAGA = { success: true, data: [{ id: 'l1', nama: 'SD No. 1 Darmasaba', jenjangPendidikan: { nama: 'SD' } }], total: 1, totalPages: 1 };

describe('loadInfoSekolah', () => {
  it('memakai statistik + lembaga (urut jenjang), tidak pernah siswa/find-many', async () => {
    const calls = mockFetch({ '/ringkasan/stats': { body: STATS }, '/lembagapendidikan/find-many': { body: LEMBAGA } });
    const r = await loadInfoSekolah();
    expect(r).toMatchObject({ totalLembaga: 1, totalSiswa: 70, totalPengajar: 70 });
    expect(calls).toHaveLength(2);
    expect(calls.find((u) => u.includes('lembagapendidikan'))).toContain('sort=jenjang');
    for (const url of calls) expect(url).not.toContain('/siswa/');
  });

  it('API gagal → melempar galat berisi status (halaman menampilkan "Coba lagi", bukan 0)', async () => {
    mockFetch({ '/ringkasan/stats': { status: 500, body: { success: false, message: 'db down' } }, '/lembagapendidikan/find-many': { body: LEMBAGA } });
    await expect(loadInfoSekolah()).rejects.toThrow(/statistik pendidikan gagal \(HTTP 500\): db down/);
  });

  it('success:false dengan HTTP 200 tetap dianggap galat', async () => {
    mockFetch({ '/ringkasan/stats': { body: STATS }, '/lembagapendidikan/find-many': { body: { success: false, message: 'x' } } });
    await expect(loadInfoSekolah()).rejects.toThrow(/daftar lembaga pendidikan gagal/);
  });

  it('lembaga melebihi batas muat → peringatan (mitigasi), data tetap dipakai', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch({ '/ringkasan/stats': { body: STATS }, '/lembagapendidikan/find-many': { body: { ...LEMBAGA, total: 150 } } });
    const r = await loadInfoSekolah();
    expect(r.totalLembaga).toBe(150);
    expect(warn).toHaveBeenCalledOnce();
  });
});

describe('loadPengajarPage', () => {
  it('meneruskan jenjang (nama), kata kunci, halaman, ukuran 10, dan urut jenjang', async () => {
    const calls = mockFetch({ '/pengajar/find-many': { body: { success: true, data: [], total: 0, totalPages: 0 } } });
    await loadPengajarPage({ jenjang: 'sd', search: 'wayan', page: 2 });
    const url = new URL(calls[0], 'http://x');
    expect(url.pathname).toBe('/api/pendidikan/infosekolahpaud/pengajar/find-many');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      page: '2',
      limit: '10',
      search: 'wayan',
      jenjangPendidikanId: 'sd',
      sort: 'jenjang',
    });
  });

  it('tanpa filter → parameter kosong tidak dikirim', async () => {
    const calls = mockFetch({ '/pengajar/find-many': { body: { success: true, data: [], total: 0, totalPages: 0 } } });
    await loadPengajarPage({ jenjang: '', search: '', page: 1 });
    const params = new URL(calls[0], 'http://x').searchParams;
    expect(params.has('search')).toBe(false);
    expect(params.has('jenjangPendidikanId')).toBe(false);
  });

  it('mengembalikan baris + total + totalPages; galat dilempar', async () => {
    mockFetch({ '/pengajar/find-many': { body: { success: true, data: [{ id: 'p1', nama: 'A', lembaga: null }], total: 11, totalPages: 2 } } });
    await expect(loadPengajarPage({ jenjang: '', search: '', page: 1 })).resolves.toEqual({
      items: [{ id: 'p1', nama: 'A', lembaga: null }],
      total: 11,
      totalPages: 2,
    });
    mockFetch({ '/pengajar/find-many': { status: 502, body: 'bad gateway' } });
    await expect(loadPengajarPage({ jenjang: '', search: '', page: 1 })).rejects.toThrow(/daftar pengajar gagal \(HTTP 502\)/);
  });
});

describe('loadJenjangNames', () => {
  it('hanya jenjang yang punya lembaga (hasLembaga=true)', async () => {
    const calls = mockFetch({ '/jenjangpendidikan/find-many': { body: { success: true, data: [{ id: 'j', nama: 'SD' }] } } });
    await expect(loadJenjangNames()).resolves.toEqual(['SD']);
    expect(calls[0]).toContain('hasLembaga=true');
  });
});
