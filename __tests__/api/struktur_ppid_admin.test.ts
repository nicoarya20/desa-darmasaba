// @vitest-environment node
// Admin Struktur PPID memakai kode struktur bersama: menu & URL lama tetap, redirect tab lama, state ke API PPID.
import { existsSync } from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const byId = { get: vi.fn(), put: vi.fn(), delete: vi.fn() };
  const resource = () =>
    Object.assign(vi.fn(() => byId), {
      create: { post: vi.fn() },
      del: vi.fn(() => byId),
      'find-many': { get: vi.fn() },
      'find-many-all': { get: vi.fn() },
    });
  return { byId, posisi: resource(), pegawai: resource(), perangkat: resource() };
});

vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      ppid: { strukturppid: { posisiorganisasi: mocks.posisi, pegawai: mocks.pegawai } },
      desa: { strukturperangkat: { posisi: mocks.perangkat, pegawai: mocks.perangkat } },
    },
  },
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { ppidMenu } from '@/app/admin/_com/nav/domains';
import { legacyPosisiRedirect, STRUKTUR_PPID_ROUTES as R } from '@/app/admin/(dashboard)/ppid/struktur-ppid/_com/struktur-ppid.routes';
import stateStrukturPpid from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid';

const ROOT = path.resolve(__dirname, '../..');
const ok = (data: unknown) => ({ status: 200, data: { success: true, message: 'ok', data } });

beforeEach(() => vi.clearAllMocks());

describe('menu & rute admin Struktur PPID', () => {
  it('ID menu dan basePath tidak berubah; menu menunjuk tab Pegawai', () => {
    expect(ppidMenu.children).toContainEqual({
      id: 'ppid.struktur-ppid',
      name: 'Struktur PPID',
      path: R.pegawai,
      basePath: '/admin/ppid/struktur-ppid',
    });
  });

  it('halaman tab Pegawai, Jabatan, Bagan + redirect URL lama tersedia', () => {
    const dir = path.join(ROOT, 'src/app/admin/(dashboard)/ppid/struktur-ppid');
    for (const page of ['pegawai', 'pegawai/create', 'pegawai/[id]', 'pegawai/[id]/edit', 'jabatan', 'bagan',
      'posisi-organisasi/[[...slug]]', 'struktur-organisasi']) {
      expect(existsSync(path.join(dir, page, 'page.tsx')), page).toBe(true);
    }
  });

  it('URL lama Posisi Organisasi diarahkan ke tab Jabatan yang setara', () => {
    expect(legacyPosisiRedirect(undefined)).toBe('/admin/ppid/struktur-ppid/jabatan');
    expect(legacyPosisiRedirect([])).toBe('/admin/ppid/struktur-ppid/jabatan');
    expect(legacyPosisiRedirect(['create'])).toBe('/admin/ppid/struktur-ppid/jabatan/create');
    expect(legacyPosisiRedirect(['kepala_desa'])).toBe('/admin/ppid/struktur-ppid/jabatan/kepala_desa/edit');
    expect(legacyPosisiRedirect(['a', 'b'])).toBe('/admin/ppid/struktur-ppid/jabatan');
  });
});

describe('state Struktur PPID (factory bersama)', () => {
  it('jabatan dimuat dari /ppid/strukturppid/posisiorganisasi, bukan Perangkat Desa', async () => {
    mocks.posisi['find-many-all'].get.mockResolvedValueOnce(ok([{ id: 'kepala_desa' }]));
    await stateStrukturPpid.posisi.findManyAll.load(true);
    expect(mocks.posisi['find-many-all'].get).toHaveBeenCalledWith({ query: { isActive: 'true' } });
    expect(stateStrukturPpid.posisi.findManyAll.data).toEqual([{ id: 'kepala_desa' }]);
    expect(mocks.perangkat['find-many-all'].get).not.toHaveBeenCalled();
  });

  it('tambah pegawai hanya mengirim field form baru ke /ppid/strukturppid/pegawai', async () => {
    mocks.pegawai.create.post.mockResolvedValueOnce(ok({ id: 'pp1' }));
    mocks.pegawai['find-many'].get.mockResolvedValue({ status: 200, data: { success: true, data: [], total: 0, totalPages: 1 } });
    stateStrukturPpid.pegawai.create.form = { ...stateStrukturPpid.pegawai.create.form, namaLengkap: ' Ni Wayan, S.Pd ', posisiId: 'kepala_desa' };

    expect(await stateStrukturPpid.pegawai.create.submit()).toBe(true);
    expect(mocks.pegawai.create.post).toHaveBeenCalledWith({
      namaLengkap: 'Ni Wayan, S.Pd',
      posisiId: 'kepala_desa',
      imageId: '',
      email: '',
      telepon: '',
      isActive: true,
    });
    expect(mocks.perangkat.create.post).not.toHaveBeenCalled();
  });
});
