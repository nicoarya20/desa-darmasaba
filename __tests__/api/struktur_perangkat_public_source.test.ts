// @vitest-environment node
// Halaman publik Struktur Perangkat Desa membaca tabel sendiri (state perangkat desa), bukan state PPID.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  perangkat: {
    pegawai: {
      findMany: { data: null as unknown[] | null, load: vi.fn() },
      findUnique: { load: vi.fn() },
    },
    posisi: { findManyAll: { data: null as unknown[] | null, load: vi.fn() } },
  },
  ppid: {
    pegawai: { findMany: { load: vi.fn() }, findUnique: { load: vi.fn() } },
    posisiOrganisasi: { findManyAll: { load: vi.fn() } },
  },
}));

vi.mock('@/app/admin/(dashboard)/_state/desa/struktur-perangkat', () => ({ default: mocks.perangkat }));
vi.mock('@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID', () => ({ default: mocks.ppid }));

import {
  loadPerangkatDetail,
  strukturPerangkatSource,
} from '@/app/(public)/(pages)/pemerintahan/profil/_com/struktur-perangkat.source';
import { STRUKTUR_PEGAWAI_LIMIT } from '@/app/(public)/_com/struktur-organisasi/struktur.meta';

const pegawai = {
  id: 'p1',
  namaLengkap: 'I Ketut Suwanta',
  isActive: true,
  image: null,
  posisi: { id: 'pd-sekretaris-desa', nama: 'Sekretaris Desa', hierarki: 2, urutan: 0, parentId: 'pd-perbekel' },
};
const posisi = { id: 'pd-perbekel', nama: 'Perbekel', hierarki: 1, urutan: 0, parentId: null };

beforeEach(() => {
  vi.resetAllMocks(); // reset juga mockImplementation yang mengisi data di test sebelumnya
  mocks.perangkat.pegawai.findMany.data = null;
  mocks.perangkat.posisi.findManyAll.data = null;
});

describe('strukturPerangkatSource', () => {
  it('memuat pegawai aktif perangkat desa (bukan PPID) dengan limit bagan', async () => {
    mocks.perangkat.pegawai.findMany.load.mockImplementation(async () => {
      mocks.perangkat.pegawai.findMany.data = [pegawai];
    });

    await expect(strukturPerangkatSource.loadPegawai()).resolves.toEqual([pegawai]);
    expect(mocks.perangkat.pegawai.findMany.load).toHaveBeenCalledWith(1, STRUKTUR_PEGAWAI_LIMIT, '', true);
    expect(mocks.ppid.pegawai.findMany.load).not.toHaveBeenCalled();
  });

  it('memuat jabatan aktif beserta atasan & urutan', async () => {
    mocks.perangkat.posisi.findManyAll.load.mockImplementation(async () => {
      mocks.perangkat.posisi.findManyAll.data = [posisi];
    });

    await expect(strukturPerangkatSource.loadPosisi()).resolves.toEqual([posisi]);
    expect(mocks.perangkat.posisi.findManyAll.load).toHaveBeenCalledWith(true);
    expect(mocks.ppid.posisiOrganisasi.findManyAll.load).not.toHaveBeenCalled();
  });

  it('data null (galat/ kosong) dibaca sebagai daftar kosong', async () => {
    await expect(strukturPerangkatSource.loadPegawai()).resolves.toEqual([]);
    await expect(strukturPerangkatSource.loadPosisi()).resolves.toEqual([]);
  });
});

describe('loadPerangkatDetail', () => {
  it('mengambil profil dari state perangkat desa', async () => {
    mocks.perangkat.pegawai.findUnique.load.mockResolvedValue(pegawai);

    await expect(loadPerangkatDetail('p1')).resolves.toEqual(pegawai);
    expect(mocks.perangkat.pegawai.findUnique.load).toHaveBeenCalledWith('p1');
    expect(mocks.ppid.pegawai.findUnique.load).not.toHaveBeenCalled();
  });

  it('tidak ditemukan → null', async () => {
    mocks.perangkat.pegawai.findUnique.load.mockResolvedValue(null);
    await expect(loadPerangkatDetail('x')).resolves.toBeNull();
  });
});
