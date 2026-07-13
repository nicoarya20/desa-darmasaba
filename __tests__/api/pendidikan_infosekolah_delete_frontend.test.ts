// @vitest-environment node
// Regresi: delete jenjang/lembaga (Info Sekolah) via Eden harus menampilkan
// PESAN SPESIFIK backend saat FK-block (400), bukan fallback generik.
//
// Bug ditemukan saat test manual: backend return 400 {message:"...N lembaga"},
// tapi Eden menaruh body respons non-2xx di res.error.value (bukan res.data),
// sehingga kode hanya membaca res.data?.message -> null -> toast generik
// "Gagal menghapus...". Test ini mengunci pembacaan res.error.value.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const toastError = vi.fn();
const toastSuccess = vi.fn();
vi.mock('react-toastify', () => ({
  toast: {
    success: (...a: unknown[]) => toastSuccess(...a),
    error: (...a: unknown[]) => toastError(...a),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';

const BASE = 'http://localhost:3000';
const jenjang = (infoSekolahPaud as any).jenjangPendidikan;
const lembaga = (infoSekolahPaud as any).lembagaPendidikan;

beforeEach(() => {
  vi.clearAllMocks();
  // Diamkan refresh list pasca-sukses.
  vi.spyOn(jenjang.findMany, 'load').mockResolvedValue(undefined as never);
  vi.spyOn(lembaga.findMany, 'load').mockResolvedValue(undefined as never);
});
afterEach(() => {
  vi.restoreAllMocks();
  server.resetHandlers();
});

describe('jenjang.delete.byId — pesan FK-block (400) tampil spesifik', () => {
  it('400 dgn message → toast.error pakai pesan backend, BUKAN generik', async () => {
    server.use(
      http.delete(`${BASE}/api/pendidikan/infosekolahpaud/jenjangpendidikan/del/:id`, () =>
        HttpResponse.json(
          { success: false, message: 'Jenjang pendidikan tidak dapat dihapus karena masih digunakan oleh 3 lembaga' },
          { status: 400 }
        )
      )
    );
    await jenjang.delete.byId('j1');
    expect(toastError).toHaveBeenCalledWith(
      expect.stringContaining('3 lembaga')
    );
  });

  it('sukses (200 success:true) → toast.success', async () => {
    server.use(
      http.delete(`${BASE}/api/pendidikan/infosekolahpaud/jenjangpendidikan/del/:id`, () =>
        HttpResponse.json({ success: true, message: 'Sukses Menghapus jenjang pendidikan' })
      )
    );
    await jenjang.delete.byId('j1');
    expect(toastSuccess).toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });
});

describe('lembaga.delete.byId — pesan FK-block (400) tampil spesifik', () => {
  it('400 dgn message → toast.error pakai pesan backend', async () => {
    server.use(
      http.delete(`${BASE}/api/pendidikan/infosekolahpaud/lembagapendidikan/del/:id`, () =>
        HttpResponse.json(
          { success: false, message: 'Lembaga pendidikan tidak dapat dihapus karena masih digunakan oleh 5 siswa' },
          { status: 400 }
        )
      )
    );
    await lembaga.delete.byId('l1');
    expect(toastError).toHaveBeenCalledWith(
      expect.stringContaining('5 siswa')
    );
  });

  it('sukses → toast.success', async () => {
    server.use(
      http.delete(`${BASE}/api/pendidikan/infosekolahpaud/lembagapendidikan/del/:id`, () =>
        HttpResponse.json({ success: true, message: 'Berhasil menghapus lembaga pendidikan' })
      )
    );
    await lembaga.delete.byId('l1');
    expect(toastSuccess).toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });
});
