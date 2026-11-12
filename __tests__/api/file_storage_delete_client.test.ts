// @vitest-environment node
// Regresi pustaka file: del() dulu memanggil `ApiFetch.api.fileStorage.delete({ id })` — Eden menganggap
// "delete" sebagai method sehingga request pergi ke DELETE /api/fileStorage (route tidak ada), bukan
// /api/fileStorage/delete/:id. Klien Eden asli dipakai untuk load(); hanya global fetch yang di-stub.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import stateFileStorage from '@/app/admin/(dashboard)/_state/state-file-storage';
import { hapusBerkasKeSampah, PESAN_BERKAS_KE_SAMPAH } from '@/lib/file-storage-delete.client';
import ApiFetch from '@/lib/api-fetch';
import stateListImage from '@/state/state-list-image';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const findManyKosong = { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } };

let fetchSpy: ReturnType<typeof vi.fn>;

function stubFetch(deleteResponse: () => Response) {
  fetchSpy = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = init?.method ?? 'GET';
    return method === 'DELETE' ? deleteResponse() : json(findManyKosong);
  });
  vi.stubGlobal('fetch', fetchSpy);
}

const deleteCalls = () =>
  fetchSpy.mock.calls.filter(([, init]) => (init as RequestInit | undefined)?.method === 'DELETE').map(([url]) => String(url));

beforeEach(() => {
  stubFetch(() => json({ message: 'File dipindahkan ke Sampah', deletedId: 'f1' }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('hapus dari pustaka file → request DELETE terkirim', () => {
  it('stateFileStorage.del mengirim DELETE /api/fileStorage/delete/:id lalu memuat ulang', async () => {
    await stateFileStorage.del({ id: 'f1' });
    expect(deleteCalls()).toHaveLength(1);
    expect(deleteCalls()[0]).toBe('/api/fileStorage/delete/f1');
    expect(fetchSpy.mock.calls.some(([url]) => String(url).includes('/api/fileStorage/findMany'))).toBe(true);
  });

  it('stateListImage.del mengirim DELETE /api/fileStorage/delete/:id', async () => {
    await stateListImage.del({ id: 'img-9' });
    expect(deleteCalls()).toEqual(['/api/fileStorage/delete/img-9']);
  });

  it('409 masih dipakai → Error berkonteks memuat pesan server, daftar tidak dimuat ulang', async () => {
    stubFetch(() => json({ success: false, message: 'File masih dipakai data lain' }, 409));
    await expect(stateListImage.del({ id: 'f2' })).rejects.toThrow(
      'Gagal memindahkan berkas f2 ke Sampah: File masih dipakai data lain',
    );
    expect(fetchSpy.mock.calls.some(([url]) => String(url).includes('findMany'))).toBe(false);
  });

  it('body 404 tanpa deletedId (status HTTP 200) tetap dianggap gagal', async () => {
    stubFetch(() => json({ status: 404, body: 'File tidak ditemukan di database' }));
    await expect(hapusBerkasKeSampah('f3')).rejects.toThrow('Gagal memindahkan berkas f3 ke Sampah');
  });

  it('jaringan putus → Error berkonteks', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network down'); }));
    await expect(hapusBerkasKeSampah('f4')).rejects.toThrow('Gagal memindahkan berkas f4 ke Sampah: network down');
  });

  it('bukti akar bug: Eden memperlakukan segmen "delete" sebagai method → DELETE /api/fileStorage', async () => {
    await ApiFetch.api.fileStorage.delete({ id: 'f5' });
    expect(deleteCalls()).toEqual([expect.stringMatching(/\/api\/fileStorage$/)]);
  });

  it('pesan sukses menyebut Sampah & masa retensi', () => {
    expect(PESAN_BERKAS_KE_SAMPAH).toBe('Berkas dipindah ke Sampah, terhapus permanen setelah 30 hari');
  });
});
