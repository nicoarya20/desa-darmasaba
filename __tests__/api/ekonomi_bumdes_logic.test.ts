// @vitest-environment node
// BUMDes publik: pemetaan respons API (profil, galeri, unit usaha, profil pengurus) dan sumber data ApiFetch
// (bukan state admin): galat dilempar berkonteks, 404 pengurus = tidak ditemukan, dokumen belum bersumber.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  profil: vi.fn(),
  foto: vi.fn(),
  unitUsaha: vi.fn(),
  pegawaiMany: vi.fn(),
  pegawaiOne: vi.fn(),
  pegawaiId: vi.fn(),
  posisi: vi.fn(),
}));

vi.mock('@/lib/api-fetch', () => {
  const profil = Object.assign({ get: (...a: unknown[]) => api.profil(...a) }, { foto: { get: (...a: unknown[]) => api.foto(...a) } });
  const pegawai = Object.assign(
    (params: { id: string }) => {
      api.pegawaiId(params);
      return { get: (...a: unknown[]) => api.pegawaiOne(...a) };
    },
    { 'find-many': { get: (...a: unknown[]) => api.pegawaiMany(...a) } },
  );
  return {
    default: {
      api: {
        ekonomi: {
          bumdes: { profil, 'unit-usaha': { 'find-many': { get: (...a: unknown[]) => api.unitUsaha(...a) } } },
          'struktur-organisasi': {
            pegawai,
            'posisi-organisasi': { 'find-many-all': { get: (...a: unknown[]) => api.posisi(...a) } },
          },
        },
      },
    },
  };
});

import {
  countPengurus,
  pengurusHref,
  readBody,
  toGaleri,
  toParagraphs,
  toPengurusDetail,
  toProfil,
  toUnitUsaha,
} from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/bumdes.logic';
import {
  loadDokumen,
  loadGaleri,
  loadPengurusDetail,
  loadProfil,
  loadUnitUsaha,
  strukturBumdesSource,
} from '@/app/(public)/(pages)/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/_com/bumdes.source';
import { buildOrgTree } from '@/app/(public)/_com/struktur-organisasi/struktur.logic';
import { STRUKTUR_PEGAWAI_LIMIT } from '@/app/(public)/_com/struktur-organisasi/struktur.meta';

// test-only: profil BUMDes stg 2026-11-16 (deskripsi dipangkas, nomor fiktif).
const PROFIL = {
  id: 'profil-bumdes',
  nama: ' BUMDes Pudak Mesari Darmasaba ',
  deskripsi: 'Paragraf pertama.\n\nParagraf kedua.\n',
  alamat: 'Jalan Tanah Putih, Darmasaba',
  kontak: '0812 3456 7890',
  tahunBerdiri: 2017,
  image: null,
};
const ok = <T,>(data: T) => ({ status: 200, data: { success: true, message: 'ok', data } });

beforeEach(() => {
  vi.resetAllMocks();
});

describe('toProfil', () => {
  it('nama dirapikan, deskripsi jadi paragraf, nomor seluler → Telepon + WhatsApp', () => {
    const profil = toProfil(PROFIL);
    expect(profil.nama).toBe('BUMDes Pudak Mesari Darmasaba');
    expect(profil.paragraphs).toEqual(['Paragraf pertama.', 'Paragraf kedua.']);
    expect(profil.tahunBerdiri).toBe(2017);
    expect(profil.phone).toMatchObject({ kind: 'mobile', telHref: 'tel:+6281234567890', waHref: 'https://wa.me/6281234567890' });
    expect(profil.kontakText).toBeNull();
    expect(profil.logo).toBeNull();
  });

  it('telepon tetap → tanpa WhatsApp; kontak bukan nomor → teks apa adanya, tanpa tombol', () => {
    expect(toProfil({ ...PROFIL, kontak: '(0361) 846 3263' }).phone).toMatchObject({ kind: 'landline', waHref: null });
    const email = toProfil({ ...PROFIL, kontak: 'bumdes@example.test' });
    expect(email.phone).toBeNull();
    expect(email.kontakText).toBe('bumdes@example.test');
  });

  it('field opsional kosong → null (barisnya tidak dirender); logo dari image.link', () => {
    const profil = toProfil({ nama: 'B', deskripsi: '', alamat: '  ', kontak: null, tahunBerdiri: null, image: { link: '/api/img/logo.webp' } });
    expect(profil).toMatchObject({ paragraphs: [], alamat: null, phone: null, kontakText: null, tahunBerdiri: null, logo: '/api/img/logo.webp' });
  });

  it('toParagraphs: null/kosong → []', () => {
    expect(toParagraphs(null)).toEqual([]);
    expect(toParagraphs(' \n \n')).toEqual([]);
  });
});

describe('toGaleri, toUnitUsaha', () => {
  it('foto tanpa berkas dibuang; keterangan kosong → null', () => {
    const galeri = toGaleri([
      { id: 'a', keterangan: ' Panen ', image: { link: '/a.webp' } },
      { id: 'b', keterangan: '', image: { link: '' } },
      { id: 'c', keterangan: '', image: null },
      { id: 'd', keterangan: null, image: { link: '/d.webp' } },
    ]);
    expect(galeri).toEqual([
      { id: 'a', keterangan: 'Panen', image: { link: '/a.webp' } },
      { id: 'd', keterangan: null, image: { link: '/d.webp' } },
    ]);
  });

  it('unit usaha urut `urutan` (kosong di belakang, urutan sama tetap urutan API)', () => {
    const units = toUnitUsaha([
      { id: 'u3', nama: 'Tanpa urutan', deskripsi: 'x', urutan: null },
      { id: 'u2', nama: 'Kios ', deskripsi: ' Jual sembako ', urutan: 2, image: { link: '/k.webp' } },
      { id: 'u1', nama: 'Air', deskripsi: 'y', urutan: 1 },
      { id: 'u4', nama: 'Air kedua', deskripsi: 'z', urutan: 1 },
    ]);
    expect(units.map((u) => u.id)).toEqual(['u1', 'u4', 'u2', 'u3']);
    expect(units[2]).toEqual({ id: 'u2', nama: 'Kios', deskripsi: 'Jual sembako', image: '/k.webp' });
  });
});

describe('profil pengurus & bagan', () => {
  it('hanya nama + gelar, jabatan, foto, inisial; field pribadi API tidak ikut', () => {
    const detail = toPengurusDetail({
      namaLengkap: 'Ni Kadek Ayu',
      gelarAkademik: 'S.E.',
      isActive: true,
      image: { link: '/f.webp' },
      posisi: { nama: 'Direktur' },
      ...{ email: 'x@example.test', telepon: '0812', alamat: 'Banjar Bucu', tanggalMasuk: '2024-01-01' },
    });
    expect(detail).toEqual({ nama: 'Ni Kadek Ayu, S.E.', jabatan: 'Direktur', foto: '/f.webp', initials: 'NA' });
  });

  it('pengurus nonaktif → null (API belum menyaring isActive)', () => {
    expect(toPengurusDetail({ namaLengkap: 'A', isActive: false, posisi: { nama: 'Direktur' } })).toBeNull();
  });

  it('countPengurus menghitung pengurus, bukan kotak "belum ditugaskan"; href profil ter-encode', () => {
    const tree = buildOrgTree(
      [{ id: 'b1', namaLengkap: 'A', isActive: true, posisi: { id: 'dir', nama: 'Direktur', hierarki: 2, parentId: 'musdes' } }],
      [
        { id: 'musdes', nama: 'Musyawarah Desa', hierarki: 1 },
        { id: 'dir', nama: 'Direktur', hierarki: 2, parentId: 'musdes' },
        { id: 'sek', nama: 'Sekretaris', hierarki: 3, parentId: 'dir' },
      ],
      { showVacant: true },
    );
    expect(countPengurus(tree)).toBe(1);
    expect(countPengurus([])).toBe(0);
    expect(pengurusHref('a b')).toBe('/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/a%20b');
  });

  it('readBody: bukan 200/success → Error berkonteks; data null tetap null', () => {
    expect(() => readBody('profil BUMDes', 500, { success: false, message: 'boom' })).toThrow('profil BUMDes gagal (HTTP 500): boom');
    expect(() => readBody('profil BUMDes', 200, null)).toThrow('respons tidak valid');
    expect(readBody('profil BUMDes', 200, { success: true, data: null })).toBeNull();
  });
});

describe('bumdes.source (ApiFetch, bukan state admin)', () => {
  it('loadProfil: data → Profil; null → null; galat → throw', async () => {
    api.profil.mockResolvedValueOnce(ok(PROFIL));
    await expect(loadProfil()).resolves.toMatchObject({ nama: 'BUMDes Pudak Mesari Darmasaba' });
    api.profil.mockResolvedValueOnce(ok(null));
    await expect(loadProfil()).resolves.toBeNull();
    api.profil.mockResolvedValueOnce({ status: 500, data: { success: false, message: 'db' } });
    await expect(loadProfil()).rejects.toThrow('profil BUMDes');
  });

  it('loadGaleri & loadUnitUsaha membaca daftar; unit usaha dimuat sekali dengan limit besar', async () => {
    api.foto.mockResolvedValueOnce(ok([{ id: 'f1', keterangan: null, image: { link: '/f1.webp' } }]));
    await expect(loadGaleri()).resolves.toHaveLength(1);
    api.unitUsaha.mockResolvedValueOnce(ok([{ id: 'u1', nama: 'Kios', deskripsi: 'x', urutan: 1 }]));
    await expect(loadUnitUsaha()).resolves.toEqual([{ id: 'u1', nama: 'Kios', deskripsi: 'x', image: null }]);
    expect(api.unitUsaha).toHaveBeenCalledWith({ query: { page: 1, limit: 100 } });
  });

  it('strukturBumdesSource memuat pengurus aktif (limit bagan) & jabatan aktif', async () => {
    api.pegawaiMany.mockResolvedValueOnce(ok([]));
    api.posisi.mockResolvedValueOnce(ok([{ id: 'musdes', nama: 'Musyawarah Desa', hierarki: 1 }]));
    await expect(strukturBumdesSource.loadPegawai()).resolves.toEqual([]);
    await expect(strukturBumdesSource.loadPosisi()).resolves.toHaveLength(1);
    expect(api.pegawaiMany).toHaveBeenCalledWith({ query: { page: 1, limit: STRUKTUR_PEGAWAI_LIMIT, isActive: 'true' } });
    expect(api.posisi).toHaveBeenCalledWith({ query: { isActive: 'true' } });
    api.posisi.mockResolvedValueOnce({ status: 500, data: null });
    await expect(strukturBumdesSource.loadPosisi()).rejects.toThrow();
  });

  it('loadPengurusDetail: 404 → null, nonaktif → null, aktif → detail, 500 → throw', async () => {
    api.pegawaiOne.mockResolvedValueOnce({ status: 404, data: { success: false, message: 'tidak ada' } });
    await expect(loadPengurusDetail('x')).resolves.toBeNull();
    expect(api.pegawaiId).toHaveBeenCalledWith({ id: 'x' });
    api.pegawaiOne.mockResolvedValueOnce(ok({ namaLengkap: 'A', isActive: false, posisi: { nama: 'Direktur' } }));
    await expect(loadPengurusDetail('b1')).resolves.toBeNull();
    api.pegawaiOne.mockResolvedValueOnce(ok({ namaLengkap: 'A', isActive: true, posisi: { nama: 'Direktur' } }));
    await expect(loadPengurusDetail('b1')).resolves.toMatchObject({ nama: 'A', jabatan: 'Direktur' });
    api.pegawaiOne.mockResolvedValueOnce({ status: 500, data: null });
    await expect(loadPengurusDetail('b1')).rejects.toThrow('profil pengurus BUMDes b1');
  });

  it('loadDokumen: belum ada sumber backend → daftar kosong (bagian tidak dirender)', async () => {
    await expect(loadDokumen()).resolves.toEqual([]);
  });
});
