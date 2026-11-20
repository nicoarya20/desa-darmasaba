// @vitest-environment node
// Lembaga & Komunitas publik: pemuat data (source). Memuat halaman demi halaman sampai habis, berhenti di batas pengaman,
// dan melempar Error berkonteks bila respons gagal/tidak valid (agar halaman menampilkan galat, bukan daftar kosong palsu).
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock('@/lib/api-fetch', () => ({
  default: { api: { desa: { lembagakomunitas: { 'find-many': { get: findMany } } } } },
}));

import {
  LEMBAGA_KOMUNITAS_MAX_HALAMAN,
  loadLembagaKomunitas,
} from '@/app/(public)/(pages)/pemerintahan/lembaga-komunitas/_com/lembaga-komunitas.source';
import { LEMBAGA_KOMUNITAS_MAX_LIMIT } from '@/lib/lembaga-komunitas';

const row = (id: string) => ({ id, nama: id, jenis: 'PKK', deskripsi: null, ketua: null, kontak: null, urutan: 0, foto: null }); // test-only
const page = (ids: string[], totalPages: number) => ({ status: 200, data: { success: true, data: ids.map(row), totalPages } });

beforeEach(() => {
  vi.resetAllMocks();
});

describe('loadLembagaKomunitas', () => {
  it('satu halaman → satu permintaan dengan limit maksimum', async () => {
    findMany.mockResolvedValue(page(['a', 'b'], 1));
    const hasil = await loadLembagaKomunitas();
    expect(hasil.map((r) => r.id)).toEqual(['a', 'b']);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({ query: { page: 1, limit: LEMBAGA_KOMUNITAS_MAX_LIMIT } });
  });

  it('beberapa halaman → digabung berurutan sampai totalPages', async () => {
    findMany.mockResolvedValueOnce(page(['a'], 3)).mockResolvedValueOnce(page(['b'], 3)).mockResolvedValueOnce(page(['c'], 3));
    expect((await loadLembagaKomunitas()).map((r) => r.id)).toEqual(['a', 'b', 'c']);
    expect(findMany.mock.calls.map((c) => c[0].query.page)).toEqual([1, 2, 3]);
  });

  it('totalPages melewati batas pengaman → berhenti di batas, tidak memuat tanpa akhir', async () => {
    findMany.mockResolvedValue(page(['x'], 999));
    await loadLembagaKomunitas();
    expect(findMany).toHaveBeenCalledTimes(LEMBAGA_KOMUNITAS_MAX_HALAMAN);
  });

  it('respons gagal atau tidak valid → Error berkonteks (nomor halaman + status + pesan)', async () => {
    findMany.mockResolvedValue({ status: 500, data: { success: false, message: 'Gagal mengambil daftar' } });
    await expect(loadLembagaKomunitas()).rejects.toThrow(/halaman 1 gagal \(HTTP 500\): Gagal mengambil daftar/);
    findMany.mockResolvedValue({ status: 200, data: { success: true, data: 'bukan-array' } });
    await expect(loadLembagaKomunitas()).rejects.toThrow(/respons tidak valid|halaman 1 gagal/);
  });

  it('halaman kedua gagal → seluruh muat gagal (tidak menampilkan separuh daftar)', async () => {
    findMany.mockResolvedValueOnce(page(['a'], 2)).mockResolvedValueOnce({ status: 503, data: null });
    await expect(loadLembagaKomunitas()).rejects.toThrow(/halaman 2 gagal \(HTTP 503\)/);
  });
});
