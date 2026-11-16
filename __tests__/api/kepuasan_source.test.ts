// @vitest-environment node
// Sumber grafik IKM publik: memakai `responden/ringkasan` (tanpa nama responden), bukan `findMany` admin-only.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api-fetch', () => ({
  default: { api: { landingpage: { responden: { ringkasan: { get: (...a: unknown[]) => get(...a) } } } } },
}));

import { kepuasanPublik, muatKepuasanPublik } from '@/app/(public)/_com/main-page/kepuasan/kepuasan.source';
import { RESPONDEN_CHART_LIMIT } from '@/app/(public)/_com/main-page/kepuasan/kepuasan.meta';

// test-only: baris ringkasan rekaan (tanpa nama responden).
const BARIS = [{ tanggal: '2026-11-01', jenisKelamin: { name: 'Perempuan' }, rating: { name: 'Baik' }, kelompokUmur: { name: 'Muda' } }];

beforeEach(() => {
  get.mockReset();
  Object.assign(kepuasanPublik, { data: null, total: 0, loading: false });
});

describe('muatKepuasanPublik', () => {
  it('sukses → data & total dari ringkasan, limit = batas grafik', async () => {
    get.mockResolvedValue({ status: 200, data: { success: true, data: BARIS, total: 7 }, error: null });
    await muatKepuasanPublik();
    expect(get).toHaveBeenCalledWith({ query: { limit: RESPONDEN_CHART_LIMIT } });
    expect(kepuasanPublik.data).toEqual(BARIS);
    expect(kepuasanPublik.total).toBe(7);
    expect(kepuasanPublik.loading).toBe(false);
  });

  it('galat server → daftar kosong + console.error berkonteks', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    get.mockResolvedValue({ status: 500, data: null, error: { value: { success: false, message: 'Gagal' } } });
    await muatKepuasanPublik();
    expect(kepuasanPublik.data).toEqual([]);
    expect(kepuasanPublik.total).toBe(0);
    expect(String(err.mock.calls[0][0])).toContain('ringkasan responden IKM');
    expect(String(err.mock.calls[0][1])).toContain('HTTP 500');
    err.mockRestore();
  });

  it('jaringan gagal → daftar kosong, loading kembali false', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    get.mockRejectedValue(new Error('offline'));
    await muatKepuasanPublik();
    expect(kepuasanPublik.data).toEqual([]);
    expect(kepuasanPublik.loading).toBe(false);
    err.mockRestore();
  });
});
