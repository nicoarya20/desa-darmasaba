// @vitest-environment node
// Admin Struktur BUMDes memakai kode struktur bersama: menu & basePath tetap, tab Profil/Unit Usaha tetap ada,
// tab struktur diganti Pegawai · Jabatan · Bagan, URL lama di-redirect, state ke API BUMDes.
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
      ekonomi: { 'struktur-organisasi': { 'posisi-organisasi': mocks.posisi, pegawai: mocks.pegawai } },
      desa: { strukturperangkat: { posisi: mocks.perangkat, pegawai: mocks.perangkat } },
    },
  },
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { ekonomiMenu } from '@/app/admin/_com/nav/domains';
import { BUMDES_TABS } from '@/app/admin/(dashboard)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_lib/layoutTabs';
import {
  legacyPosisiRedirect,
  STRUKTUR_BUMDES_ROUTES as R,
} from '@/app/admin/(dashboard)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/struktur-bumdes.routes';
import stateStrukturBumdes from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi';

const ROOT = path.resolve(__dirname, '../..');
const BASE = '/admin/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes';
const ok = (data: unknown) => ({ status: 200, data: { success: true, message: 'ok', data } });

beforeEach(() => vi.clearAllMocks());

describe('menu & tab admin BUMDes', () => {
  it('ID menu, path, dan basePath tidak berubah', () => {
    expect(ekonomiMenu.children).toContainEqual({
      id: 'ekonomi.bumdes',
      name: 'BUMDes',
      path: `${BASE}/profil`,
      basePath: BASE,
    });
  });

  it('tab Profil BUMDes & Unit Usaha tetap di depan, tab struktur menjadi Pegawai · Jabatan · Bagan', () => {
    expect(BUMDES_TABS.map((t) => [t.label, t.href])).toEqual([
      ['Profil BUMDes', `${BASE}/profil`],
      ['Unit Usaha', `${BASE}/unit-usaha`],
      ['Pegawai', `${BASE}/pegawai`],
      ['Jabatan', `${BASE}/jabatan`],
      ['Bagan', `${BASE}/bagan`],
    ]);
    expect(R.pegawaiEdit('p1')).toBe(`${BASE}/pegawai/p1/edit`);
  });

  it('halaman tab + redirect URL lama tersedia, tab Profil/Unit Usaha tetap ada', () => {
    const dir = path.join(ROOT, 'src/app/admin/(dashboard)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes');
    for (const page of ['profil', 'unit-usaha', 'pegawai', 'pegawai/create', 'pegawai/[id]', 'pegawai/[id]/edit',
      'jabatan', 'jabatan/create', 'jabatan/[id]/edit', 'bagan', 'posisi-organisasi/[[...slug]]', 'struktur-organisasi']) {
      expect(existsSync(path.join(dir, page, 'page.tsx')), page).toBe(true);
    }
  });

  it('URL lama Posisi Organisasi diarahkan ke tab Jabatan yang setara', () => {
    expect(legacyPosisiRedirect(undefined)).toBe(`${BASE}/jabatan`);
    expect(legacyPosisiRedirect(['create'])).toBe(`${BASE}/jabatan/create`);
    expect(legacyPosisiRedirect(['direktur'])).toBe(`${BASE}/jabatan/direktur/edit`);
    expect(legacyPosisiRedirect(['a', 'b'])).toBe(`${BASE}/jabatan`);
  });
});

describe('state Struktur BUMDes (factory bersama)', () => {
  it('jabatan dimuat dari /ekonomi/struktur-organisasi/posisi-organisasi, bukan Perangkat Desa', async () => {
    mocks.posisi['find-many-all'].get.mockResolvedValueOnce(ok([{ id: 'direktur' }]));
    await stateStrukturBumdes.posisi.findManyAll.load(true);
    expect(mocks.posisi['find-many-all'].get).toHaveBeenCalledWith({ query: { isActive: 'true' } });
    expect(stateStrukturBumdes.posisi.findManyAll.data).toEqual([{ id: 'direktur' }]);
    expect(mocks.perangkat['find-many-all'].get).not.toHaveBeenCalled();
  });

  it('tambah pegawai hanya mengirim field form baru (tanpa gelar/tanggal masuk/alamat)', async () => {
    mocks.pegawai.create.post.mockResolvedValueOnce(ok({ id: 'b1' }));
    mocks.pegawai['find-many'].get.mockResolvedValue({ status: 200, data: { success: true, data: [], total: 0, totalPages: 1 } });
    stateStrukturBumdes.pegawai.create.form = {
      ...stateStrukturBumdes.pegawai.create.form,
      namaLengkap: ' Ni Kadek, S.E. ',
      posisiId: 'direktur',
    };

    expect(await stateStrukturBumdes.pegawai.create.submit()).toBe(true);
    expect(mocks.pegawai.create.post).toHaveBeenCalledWith({
      namaLengkap: 'Ni Kadek, S.E.',
      posisiId: 'direktur',
      imageId: '',
      email: '',
      telepon: '',
      isActive: true,
    });
    expect(mocks.perangkat.create.post).not.toHaveBeenCalled();
  });
});
