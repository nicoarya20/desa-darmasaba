// @vitest-environment node
// Halaman publik Struktur PPID membaca state PPID (kode bersama), bukan state Perangkat Desa.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ppid: {
    pegawai: {
      findMany: { data: null as unknown[] | null, load: vi.fn() },
      findUnique: { load: vi.fn() },
    },
    posisi: { findManyAll: { data: null as unknown[] | null, load: vi.fn() } },
  },
  perangkat: {
    pegawai: { findMany: { load: vi.fn() }, findUnique: { load: vi.fn() } },
    posisi: { findManyAll: { load: vi.fn() } },
  },
}));

vi.mock('@/app/admin/(dashboard)/_state/ppid/struktur_ppid', () => ({ default: mocks.ppid }));
vi.mock('@/app/admin/(dashboard)/_state/desa/struktur-perangkat', () => ({ default: mocks.perangkat }));

import {
  loadPegawaiPpidDetail,
  strukturPpidSource,
} from '@/app/(public)/(pages)/ppid/struktur-ppid/_com/struktur-ppid.source';
import { STRUKTUR_PEGAWAI_LIMIT } from '@/app/(public)/_com/struktur-organisasi/struktur.meta';

// test-only
const pegawai = {
  id: 'pp1',
  namaLengkap: 'Ida Bagus Surya, S.H.',
  isActive: true,
  image: null,
  posisi: { id: 'kepala_desa', nama: 'Kepala Desa', hierarki: 1, urutan: 0, parentId: null },
};
const posisi = { id: 'sekretaris_desa', nama: 'Sekretaris Desa', hierarki: 2, urutan: 1, parentId: 'kepala_desa' };

beforeEach(() => {
  vi.resetAllMocks();
  mocks.ppid.pegawai.findMany.data = null;
  mocks.ppid.posisi.findManyAll.data = null;
});

describe('strukturPpidSource', () => {
  it('memuat pegawai PPID aktif dengan limit bagan (bukan Perangkat Desa)', async () => {
    mocks.ppid.pegawai.findMany.load.mockImplementation(async () => {
      mocks.ppid.pegawai.findMany.data = [pegawai];
    });

    await expect(strukturPpidSource.loadPegawai()).resolves.toEqual([pegawai]);
    expect(mocks.ppid.pegawai.findMany.load).toHaveBeenCalledWith(1, STRUKTUR_PEGAWAI_LIMIT, '', true);
    expect(mocks.perangkat.pegawai.findMany.load).not.toHaveBeenCalled();
  });

  it('memuat jabatan aktif beserta atasan & urutan', async () => {
    mocks.ppid.posisi.findManyAll.load.mockImplementation(async () => {
      mocks.ppid.posisi.findManyAll.data = [posisi];
    });

    await expect(strukturPpidSource.loadPosisi()).resolves.toEqual([posisi]);
    expect(mocks.ppid.posisi.findManyAll.load).toHaveBeenCalledWith(true);
    expect(mocks.perangkat.posisi.findManyAll.load).not.toHaveBeenCalled();
  });

  it('data null (galat/kosong) dibaca sebagai daftar kosong', async () => {
    await expect(strukturPpidSource.loadPegawai()).resolves.toEqual([]);
    await expect(strukturPpidSource.loadPosisi()).resolves.toEqual([]);
  });
});

describe('loadPegawaiPpidDetail', () => {
  it('mengambil profil dari state PPID; tidak ditemukan → null', async () => {
    mocks.ppid.pegawai.findUnique.load.mockResolvedValueOnce(pegawai);
    await expect(loadPegawaiPpidDetail('pp1')).resolves.toEqual(pegawai);
    expect(mocks.ppid.pegawai.findUnique.load).toHaveBeenCalledWith('pp1');

    mocks.ppid.pegawai.findUnique.load.mockResolvedValueOnce(null);
    await expect(loadPegawaiPpidDetail('x')).resolves.toBeNull();
    expect(mocks.perangkat.pegawai.findUnique.load).not.toHaveBeenCalled();
  });
});
