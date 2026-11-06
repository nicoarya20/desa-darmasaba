// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prestasiGet = vi.fn();
const penghargaanGet = vi.fn();

vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      landingpage: { prestasidesa: { 'find-many': { get: prestasiGet } } },
      desa: { penghargaan: { 'find-many': { get: penghargaanGet } } },
    },
  },
}));

const { loadPrestasiPage } = await import('@/app/darmasaba/_com/main-page/prestasi/prestasi.source');

// test-only: respons find-many sukses (data sudah urut createdAt desc dari backend).
const ok = (rows: { id: string; createdAt: string }[], total = rows.length) => ({
  status: 200,
  data: { success: true, data: rows.map((r) => ({ ...r, name: `Item ${r.id}`, image: null })), total },
});

describe('loadPrestasiPage', () => {
  beforeEach(() => {
    prestasiGet.mockReset();
    penghargaanGet.mockReset();
  });

  it('beranda: minta limit 4 dari kedua sumber, gabung 4 terbaru, total dijumlah', async () => {
    prestasiGet.mockResolvedValue(ok([{ id: 'p2', createdAt: '2026-11-05' }, { id: 'p1', createdAt: '2026-11-01' }], 4));
    penghargaanGet.mockResolvedValue(ok([{ id: 'h3', createdAt: '2026-11-04' }, { id: 'h2', createdAt: '2026-11-03' }, { id: 'h1', createdAt: '2026-11-02' }], 4));

    const res = await loadPrestasiPage({ page: 1, pageSize: 4 });

    expect(prestasiGet).toHaveBeenCalledWith({ query: { page: 1, limit: 4 } });
    expect(penghargaanGet).toHaveBeenCalledWith({ query: { page: 1, limit: 4 } });
    expect(res.items.map((i) => i.id)).toEqual(['p2', 'h3', 'h2', 'h1']);
    expect(res.total).toBe(8);
  });

  it('halaman 2: minta page×size teratas, kembalikan potongan kedua; search diteruskan (trim)', async () => {
    prestasiGet.mockResolvedValue(ok([{ id: 'p2', createdAt: '2026-11-05' }, { id: 'p1', createdAt: '2026-11-01' }]));
    penghargaanGet.mockResolvedValue(ok([{ id: 'h2', createdAt: '2026-11-04' }, { id: 'h1', createdAt: '2026-11-02' }]));

    const res = await loadPrestasiPage({ page: 2, pageSize: 2, search: '  juara ' });

    expect(prestasiGet).toHaveBeenCalledWith({ query: { page: 1, limit: 4, search: 'juara' } });
    expect(res.items.map((i) => i.id)).toEqual(['h1', 'p1']);
  });

  it('satu sumber gagal → error dengan konteks sumber & status (tidak ditelan)', async () => {
    prestasiGet.mockResolvedValue(ok([]));
    penghargaanGet.mockResolvedValue({ status: 500, data: { success: false, message: 'db down' } });

    await expect(loadPrestasiPage({ page: 1, pageSize: 4 })).rejects.toThrow('find-many penghargaan gagal (HTTP 500): db down');
  });
});
