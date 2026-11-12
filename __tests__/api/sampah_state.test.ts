// @vitest-environment node
// State Pengaturan → Sampah: query endpoint yang benar, ganti tab/cari → halaman 1,
// pulihkan / hapus permanen / kosongkan memuat ulang daftar + jumlah, error ditampilkan.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SampahItem } from '@/lib/sampah/sampah-item';

const mocks = vi.hoisted(() => {
  const byId = { pulihkan: { post: vi.fn() }, delete: vi.fn() };
  const root = Object.assign(vi.fn(() => byId), { get: vi.fn(), delete: vi.fn() });
  return { byId, root, toast: { success: vi.fn(), error: vi.fn() } };
});

vi.mock('@/lib/api-fetch', () => ({ default: { api: { pengaturan: { sampah: mocks.root } } } }));
vi.mock('react-toastify', () => ({ toast: mocks.toast }));

import sampahState from '@/app/admin/(dashboard)/_state/pengaturan/sampah-state';

const item = (id: string): SampahItem => ({
  id,
  jenis: 'file',
  judul: id,
  mimeType: 'image/png',
  kategori: 'image',
  ukuran: 10,
  pratinjauUrl: null,
  dihapusPada: '2026-11-10T00:00:00.000Z',
  sisaHari: 27,
  asal: { kelompokId: 'PPID', kelompokNama: 'PPID', menuId: 'ppid.profil-ppid', menuNama: 'Profil PPID' },
}); // test-only

const listOk = (items: SampahItem[], counts: Record<string, number>, total = items.length) => ({
  status: 200,
  data: {
    success: true,
    data: { items, counts, kelompok: [{ id: 'PPID', nama: 'PPID' }, { id: 'lainnya', nama: 'Lainnya' }], page: 1, limit: 20, total },
  },
});
const gagal = (status: number, message: string) => ({ status, data: null, error: { status, value: { success: false, message } } });

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(sampahState, { kelompokAktif: 'semua', page: 1, cari: '', items: [], counts: {}, total: 0, error: null, busy: null });
});

describe('load', () => {
  it('GET dengan kelompok, page, limit, cari; isi items + counts + kelompok', async () => {
    mocks.root.get.mockResolvedValueOnce(listOk([item('file:a')], { semua: 1, PPID: 1, lainnya: 0 }));
    await sampahState.load();
    expect(mocks.root.get).toHaveBeenCalledWith({ query: { kelompok: 'semua', page: 1, limit: 20, cari: '' } });
    expect(sampahState.items.map((i) => i.id)).toEqual(['file:a']);
    expect(sampahState.counts).toEqual({ semua: 1, PPID: 1, lainnya: 0 });
    expect(sampahState.kelompok.map((k) => k.id)).toEqual(['PPID', 'lainnya']);
    expect(sampahState.loading).toBe(false);
  });

  it('ganti tab & cari → kembali ke halaman 1 dengan query baru', async () => {
    mocks.root.get.mockResolvedValue(listOk([], { semua: 0 }));
    sampahState.page = 4;
    await sampahState.setKelompok('PPID');
    expect(mocks.root.get).toHaveBeenLastCalledWith({ query: { kelompok: 'PPID', page: 1, limit: 20, cari: '' } });
    sampahState.page = 3;
    await sampahState.setCari('sk');
    expect(mocks.root.get).toHaveBeenLastCalledWith({ query: { kelompok: 'PPID', page: 1, limit: 20, cari: 'sk' } });
    await sampahState.setPage(2);
    expect(mocks.root.get).toHaveBeenLastCalledWith({ query: { kelompok: 'PPID', page: 2, limit: 20, cari: 'sk' } });
  });

  it('403 → pesan server di toast & error, daftar tidak berubah', async () => {
    mocks.root.get.mockResolvedValueOnce(gagal(403, 'Hanya Super Admin dan Developer'));
    await sampahState.load();
    expect(mocks.toast.error).toHaveBeenCalledWith('Hanya Super Admin dan Developer');
    expect(sampahState.error).toBe('Hanya Super Admin dan Developer');
  });

  it('respons lama (tab sudah berganti) diabaikan', async () => {
    let lepasLama: (v: unknown) => void = () => undefined;
    mocks.root.get
      .mockImplementationOnce(() => new Promise((resolve) => (lepasLama = resolve)))
      .mockResolvedValueOnce(listOk([item('file:baru')], { semua: 1 }));
    const lama = sampahState.load();
    await sampahState.setKelompok('PPID');
    lepasLama(listOk([item('file:lama')], { semua: 9 }));
    await lama;
    expect(sampahState.items.map((i) => i.id)).toEqual(['file:baru']);
    expect(sampahState.counts).toEqual({ semua: 1 });
  });
});

describe('aksi item', () => {
  it('pulihkan → POST /:id/pulihkan (id di-encode), toast sukses, muat ulang counts', async () => {
    mocks.byId.pulihkan.post.mockResolvedValueOnce({ status: 200, data: { success: true, message: 'Berkas dipulihkan' } });
    mocks.root.get.mockResolvedValueOnce(listOk([], { semua: 0, PPID: 0 }));
    expect(await sampahState.pulihkan(item('file:a'))).toBe(true);
    expect(mocks.root).toHaveBeenCalledWith({ id: 'file%3Aa' });
    expect(mocks.toast.success).toHaveBeenCalledWith('Berkas dipulihkan');
    expect(mocks.root.get).toHaveBeenCalledTimes(1);
    expect(sampahState.counts).toEqual({ semua: 0, PPID: 0 });
    expect(sampahState.busy).toBeNull();
  });

  it('hapus permanen item terakhir di halaman 2 → DELETE /:id lalu muat halaman 1', async () => {
    sampahState.page = 2;
    sampahState.items = [item('dak:x')];
    mocks.byId.delete.mockResolvedValueOnce({ status: 200, data: { success: true, message: 'Dihapus permanen' } });
    mocks.root.get.mockResolvedValueOnce(listOk([], { semua: 20 }, 20));
    expect(await sampahState.hapusPermanen(item('dak:x'))).toBe(true);
    expect(mocks.root).toHaveBeenCalledWith({ id: 'dak%3Ax' });
    expect(mocks.byId.delete).toHaveBeenCalledTimes(1);
    expect(mocks.root.get).toHaveBeenCalledWith({ query: { kelompok: 'semua', page: 1, limit: 20, cari: '' } });
  });

  it('409 (masih dipakai) → toast pesan server, tidak memuat ulang', async () => {
    mocks.byId.delete.mockResolvedValueOnce(gagal(409, 'Berkas masih dipakai'));
    expect(await sampahState.hapusPermanen(item('file:a'))).toBe(false);
    expect(mocks.toast.error).toHaveBeenCalledWith('Berkas masih dipakai');
    expect(mocks.root.get).not.toHaveBeenCalled();
  });

  it('jaringan putus → toast fallback, busy dilepas', async () => {
    mocks.byId.pulihkan.post.mockRejectedValueOnce(new Error('network down'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(await sampahState.pulihkan(item('file:a'))).toBe(false);
    expect(mocks.toast.error).toHaveBeenCalledWith('Gagal memulihkan item');
    expect(sampahState.busy).toBeNull();
  });
});

describe('kosongkan', () => {
  it('DELETE ?kelompok=<aktif>, toast pesan server, kembali ke halaman 1 & muat ulang counts', async () => {
    Object.assign(sampahState, { kelompokAktif: 'PPID', page: 3 });
    mocks.root.delete.mockResolvedValueOnce({ status: 200, data: { success: true, message: '5 item dihapus permanen', data: { dihapus: 5 } } });
    mocks.root.get.mockResolvedValueOnce(listOk([], { semua: 0, PPID: 0 }));
    expect(await sampahState.kosongkan()).toBe(true);
    expect(mocks.root.delete).toHaveBeenCalledWith(undefined, { query: { kelompok: 'PPID' } });
    expect(mocks.toast.success).toHaveBeenCalledWith('5 item dihapus permanen');
    expect(mocks.root.get).toHaveBeenCalledWith({ query: { kelompok: 'PPID', page: 1, limit: 20, cari: '' } });
    expect(sampahState.counts).toEqual({ semua: 0, PPID: 0 });
    expect(sampahState.kosongkanLoading).toBe(false);
  });

  it('ditolak → toast error, tidak memuat ulang', async () => {
    mocks.root.delete.mockResolvedValueOnce(gagal(400, 'Parameter kelompok wajib diisi'));
    expect(await sampahState.kosongkan()).toBe(false);
    expect(mocks.toast.error).toHaveBeenCalledWith('Parameter kelompok wajib diisi');
    expect(mocks.root.get).not.toHaveBeenCalled();
  });
});
