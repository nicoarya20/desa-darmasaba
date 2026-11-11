// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prestasiGet = vi.fn();

// Hanya endpoint prestasi desa yang ada; endpoint desa/penghargaan sudah dihapus.
vi.mock('@/lib/api-fetch', () => ({
  default: { api: { landingpage: { prestasidesa: { 'find-many': { get: prestasiGet } } } } },
}));

const { loadPrestasiPage } = await import('@/app/darmasaba/_com/main-page/prestasi/prestasi.source');

// test-only: respons find-many sukses (data sudah urut createdAt desc + dipaginasi oleh backend).
const ok = (rows: { id: string; createdAt: string; kategori?: string }[], total?: number) => ({
  status: 200,
  data: {
    success: true,
    data: rows.map((r) => ({ ...r, name: `Item ${r.id}`, image: null, kategori: { name: r.kategori ?? 'Lainnya' } })),
    ...(total === undefined ? {} : { total }),
  },
});

describe('loadPrestasiPage', () => {
  beforeEach(() => prestasiGet.mockReset());

  it('beranda: satu panggilan find-many page 1 limit 4, urutan & total dari server', async () => {
    prestasiGet.mockResolvedValue(
      ok(
        [
          { id: 'p2', createdAt: '2026-11-05' },
          { id: 'h3', createdAt: '2026-11-04', kategori: 'Penghargaan' },
          { id: 'h2', createdAt: '2026-11-03', kategori: 'Penghargaan' },
          { id: 'p1', createdAt: '2026-11-01' },
        ],
        8,
      ),
    );

    const res = await loadPrestasiPage({ page: 1, pageSize: 4 });

    expect(prestasiGet).toHaveBeenCalledTimes(1);
    expect(prestasiGet).toHaveBeenCalledWith({ query: { page: 1, limit: 4 } });
    expect(res.items.map((i) => [i.id, i.source, i.href])).toEqual([
      ['p2', 'prestasi', '/darmasaba/prestasi-desa/p2'],
      ['h3', 'penghargaan', '/darmasaba/prestasi-desa/h3'],
      ['h2', 'penghargaan', '/darmasaba/prestasi-desa/h2'],
      ['p1', 'prestasi', '/darmasaba/prestasi-desa/p1'],
    ]);
    expect(res.total).toBe(8);
  });

  it('halaman 2: page & limit diteruskan apa adanya (paginasi di server); search di-trim', async () => {
    prestasiGet.mockResolvedValue(ok([{ id: 'p1', createdAt: '2026-11-01' }], 3));

    const res = await loadPrestasiPage({ page: 2, pageSize: 2, search: '  juara ' });

    expect(prestasiGet).toHaveBeenCalledWith({ query: { page: 2, limit: 2, search: 'juara' } });
    expect(res).toEqual({ items: [expect.objectContaining({ id: 'p1' })], total: 3 });
  });

  it('search kosong/spasi tidak dikirim; halaman tidak valid jadi 1; total absen → jumlah item', async () => {
    prestasiGet.mockResolvedValue(ok([{ id: 'p1', createdAt: '2026-11-01' }]));

    const res = await loadPrestasiPage({ page: 0, pageSize: 8, search: '   ' });

    expect(prestasiGet).toHaveBeenCalledWith({ query: { page: 1, limit: 8 } });
    expect(res.total).toBe(1);
  });

  it('gagal → error dengan konteks status & pesan server (tidak ditelan)', async () => {
    prestasiGet.mockResolvedValue({ status: 500, data: { success: false, message: 'db down' } });
    await expect(loadPrestasiPage({ page: 1, pageSize: 4 })).rejects.toThrow('find-many prestasi gagal (HTTP 500): db down');
  });

  it('respons 200 tanpa array data → error "respons tidak valid"', async () => {
    prestasiGet.mockResolvedValue({ status: 200, data: null });
    await expect(loadPrestasiPage({ page: 1, pageSize: 4 })).rejects.toThrow('find-many prestasi gagal (HTTP 200): respons tidak valid');
  });
});
