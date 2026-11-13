// @vitest-environment node
// Halaman publik BUMDes membaca state Struktur BUMDes (kode bersama), bukan PPID/Perangkat Desa; section struktur
// memakai bagan bersama (chart primereact lama dihapus) dan kartu menuju profil pengurus BUMDes.
import { existsSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  bumdes: {
    pegawai: {
      findMany: { data: null as unknown[] | null, load: vi.fn() },
      findUnique: { load: vi.fn() },
    },
    posisi: { findManyAll: { data: null as unknown[] | null, load: vi.fn() } },
  },
  ppid: {
    pegawai: { findMany: { load: vi.fn() }, findUnique: { load: vi.fn() } },
    posisi: { findManyAll: { load: vi.fn() } },
  },
}));

vi.mock('@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi', () => ({ default: mocks.bumdes }));
vi.mock('@/app/admin/(dashboard)/_state/ppid/struktur_ppid', () => ({ default: mocks.ppid }));
vi.mock('next-view-transitions', () => ({ useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));

import {
  loadPegawaiBumdesDetail,
  strukturBumdesSource,
} from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/struktur-bumdes.source';
import { strukturBumdesHref } from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/struktur-bumdes.meta';
import StrukturBumdesSection from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/StrukturBumdesSection';
import { STRUKTUR_PEGAWAI_LIMIT } from '@/app/(public)/_com/struktur-organisasi/struktur.meta';

const ROOT = path.resolve(__dirname, '../..');
const PAGE_DIR = path.join(ROOT, 'src/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes');

// test-only
const pegawai = {
  id: 'b1',
  namaLengkap: 'Ni Kadek Ayu, S.E.',
  isActive: true,
  image: null,
  posisi: { id: 'direktur', nama: 'Direktur', hierarki: 1, urutan: 0, parentId: null },
};
const posisi = { id: 'sekretaris', nama: 'Sekretaris', hierarki: 2, urutan: 1, parentId: 'direktur' };

beforeEach(() => {
  vi.resetAllMocks();
  mocks.bumdes.pegawai.findMany.data = null;
  mocks.bumdes.posisi.findManyAll.data = null;
});

describe('strukturBumdesSource', () => {
  it('memuat pegawai BUMDes aktif dengan limit bagan (bukan PPID)', async () => {
    mocks.bumdes.pegawai.findMany.load.mockImplementation(async () => {
      mocks.bumdes.pegawai.findMany.data = [pegawai];
    });
    await expect(strukturBumdesSource.loadPegawai()).resolves.toEqual([pegawai]);
    expect(mocks.bumdes.pegawai.findMany.load).toHaveBeenCalledWith(1, STRUKTUR_PEGAWAI_LIMIT, '', true);
    expect(mocks.ppid.pegawai.findMany.load).not.toHaveBeenCalled();
  });

  it('memuat jabatan aktif beserta atasan & urutan', async () => {
    mocks.bumdes.posisi.findManyAll.load.mockImplementation(async () => {
      mocks.bumdes.posisi.findManyAll.data = [posisi];
    });
    await expect(strukturBumdesSource.loadPosisi()).resolves.toEqual([posisi]);
    expect(mocks.bumdes.posisi.findManyAll.load).toHaveBeenCalledWith(true);
  });

  it('data null (galat/kosong) dibaca sebagai daftar kosong', async () => {
    await expect(strukturBumdesSource.loadPegawai()).resolves.toEqual([]);
    await expect(strukturBumdesSource.loadPosisi()).resolves.toEqual([]);
  });
});

describe('profil pengurus BUMDes', () => {
  it('loadPegawaiBumdesDetail mengambil dari state BUMDes; tidak ditemukan → null', async () => {
    mocks.bumdes.pegawai.findUnique.load.mockResolvedValueOnce(pegawai);
    await expect(loadPegawaiBumdesDetail('b1')).resolves.toEqual(pegawai);
    expect(mocks.bumdes.pegawai.findUnique.load).toHaveBeenCalledWith('b1');
    mocks.bumdes.pegawai.findUnique.load.mockResolvedValueOnce(null);
    await expect(loadPegawaiBumdesDetail('x')).resolves.toBeNull();
    expect(mocks.ppid.pegawai.findUnique.load).not.toHaveBeenCalled();
  });

  it('kartu bagan menuju halaman detail BUMDes (URL lama tetap)', () => {
    expect(strukturBumdesHref('b1')).toBe('/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/b1');
    expect(existsSync(path.join(PAGE_DIR, '[id]/page.tsx'))).toBe(true);
  });
});

describe('section Struktur Pengurus BUMDes', () => {
  it('memakai bagan bersama: judul, kotak cari, kerangka memuat; chart & CSS lama sudah dihapus', () => {
    const html = renderToStaticMarkup(
      <MantineProvider env="test">
        <StrukturBumdesSection />
      </MantineProvider>
    );
    expect(html).toContain('Struktur Pengurus &amp; SK');
    expect(html).toContain('aria-label="Cari nama atau jabatan"');
    expect(html).not.toContain('p-organizationchart');
    expect(existsSync(path.join(PAGE_DIR, 'struktur.css'))).toBe(false);
  });
});
