// @vitest-environment node
// State admin Laporan Publik: pemuat admin meminta tampilan moderasi, dan toast kiriman mengikuti status dari server
// (ditahan → "menunggu verifikasi"; 429 → pesan server).
import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ create: vi.fn(), findMany: vi.fn() }));
vi.mock('@/lib/api-fetch', () => ({
  default: { api: { keamanan: { laporanpublik: { create: { post: api.create }, 'find-many': { get: api.findMany } } } } },
}));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), warn: vi.fn() }));
vi.mock('react-toastify', () => ({ toast }));

import laporanPublikState, { PESAN_MENUNGGU_VERIFIKASI } from '@/app/admin/(dashboard)/_state/keamanan/laporan-publik';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  // Di dalam beforeEach: MSW (setup.ts) memasang fetch-nya sendiri saat beforeAll.
  vi.stubGlobal('fetch', fetchMock);
  api.findMany.mockResolvedValue({ status: 200, data: { success: true, data: [], totalPages: 1 } });
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true, data: { id: 'lap-1', penanganan: [] } }) });
  // test-only: isian form valid
  laporanPublikState.create.form = { judul: 'Sampah liar', lokasi: 'Banjar Tengah', tanggalWaktu: '2026-11-05T02:00:00.000Z', kronologi: '' };
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('pemuat admin meminta tampilan moderasi', () => {
  it('daftar: find-many dengan moderasi=true', async () => {
    await laporanPublikState.findMany.load(2, 10, 'pohon');
    expect(api.findMany).toHaveBeenCalledWith({ query: { page: 2, limit: 10, search: 'pohon', moderasi: 'true' } });
  });

  it('detail & edit: /:id?moderasi=true', async () => {
    await laporanPublikState.findUnique.load('lap-1');
    await laporanPublikState.edit.load('lap-1');
    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual([
      '/api/keamanan/laporanpublik/lap-1?moderasi=true',
      '/api/keamanan/laporanpublik/lap-1?moderasi=true',
    ]);
  });
});

describe('toast setelah kirim laporan', () => {
  it('kiriman ditahan (status Baru) → pesan menunggu verifikasi', async () => {
    api.create.mockResolvedValue({ status: 200, error: null, data: { success: true, data: { status: 'Baru' } } });
    await laporanPublikState.create.create();
    expect(toast.success).toHaveBeenCalledWith(PESAN_MENUNGGU_VERIFIKASI);
  });

  it('kiriman admin (status Proses) → pesan sukses biasa', async () => {
    api.create.mockResolvedValue({ status: 200, error: null, data: { success: true, data: { status: 'Proses' } } });
    await laporanPublikState.create.create();
    expect(toast.success).toHaveBeenCalledWith('Sukses menambahkan');
  });

  it('batas kiriman (429) → pesan server ditampilkan & galat dilempar (modal tetap terbuka)', async () => {
    const message = 'Terlalu banyak laporan dikirim. Coba lagi dalam 120 detik.';
    api.create.mockResolvedValue({ status: 429, data: null, error: { status: 429, value: { success: false, message } } });
    await expect(laporanPublikState.create.create()).rejects.toThrow(message);
    expect(toast.error).toHaveBeenCalledWith(message);
    expect(toast.success).not.toHaveBeenCalled();
  });
});
