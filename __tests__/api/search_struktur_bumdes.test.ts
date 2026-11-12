// @vitest-environment node
// Pencarian publik tipe "strukturOrganisasi" (prisma di-mock): sumbernya pegawai BUMDes aktif (bukan tabel lama
// `strukturBumDes` yang sudah dihapus), cocok ke nama/email/telepon/nama jabatan, dan tautannya ke profil pegawai.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, accessed } = vi.hoisted(() => {
  const accessed = new Set<string>();
  // Semua delegate prisma → findMany kosong; dipakai blok GLOBAL SEARCH yang membaca ±90 tabel sekaligus.
  const delegates: Record<string, { findMany: ReturnType<typeof vi.fn> }> = {};
  const prismaMock = new Proxy(delegates, {
    get(target, key: string) {
      accessed.add(key);
      target[key] ??= { findMany: vi.fn().mockResolvedValue([]) };
      return target[key];
    },
  });
  return { prismaMock, accessed };
});
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import searchFindMany from '@/app/api/[[...slugs]]/_lib/search/findMany';
import getDetailUrl from '@/app/(public)/_com/searchUrl';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context Elysia tiruan minimal
const ctx = (query: Record<string, string>): any => ({ query, params: {}, set: { status: 200 } });
const pegawai = () => prismaMock.pegawaiBumDes.findMany;
const baris = { id: 'peg-1', namaLengkap: 'Ni Kadek Ayu, S.E.', posisi: { nama: 'Bendahara' } };

beforeEach(() => {
  vi.clearAllMocks();
  accessed.clear();
  pegawai().mockResolvedValue([baris]);
});

describe('search strukturOrganisasi (Struktur BUMDes)', () => {
  it('per-type membaca pegawaiBumDes aktif, mencocokkan nama/email/telepon/nama jabatan, berpaginasi', async () => {
    const res = await searchFindMany(ctx({ query: 'bendahara', type: 'strukturOrganisasi', page: '2', limit: '5' }));

    expect(accessed.has('strukturBumDes')).toBe(false);
    expect(pegawai()).toHaveBeenCalledTimes(1);
    const args = pegawai().mock.calls[0][0];
    const contains = { contains: 'bendahara', mode: 'insensitive' };
    expect(args.where).toEqual({
      isActive: true,
      posisi: { isActive: true },
      OR: [{ namaLengkap: contains }, { email: contains }, { telepon: contains }, { posisi: { nama: contains } }],
    });
    expect(args).toMatchObject({ skip: 5, take: 5 });
    expect(res).toEqual({ data: [{ id: 'peg-1', name: 'Ni Kadek Ayu, S.E.', jabatan: 'Bendahara' }], nextPage: null });
  });

  it('global search membaca pegawaiBumDes (bukan strukturBumDes) dan memuat hasilnya', async () => {
    const res = (await searchFindMany(ctx({ query: 'ayu' }))) as { data: Record<string, unknown>[] };

    expect(accessed.has('strukturBumDes')).toBe(false);
    expect(pegawai()).toHaveBeenCalledTimes(1);
    expect(pegawai().mock.calls[0][0]).toMatchObject({ take: 10 });
    expect(pegawai().mock.calls[0][0].where.OR).toContainEqual({ posisi: { nama: { contains: 'ayu', mode: 'insensitive' } } });
    expect(res.data).toContainEqual({ type: 'strukturOrganisasi', id: 'peg-1', name: 'Ni Kadek Ayu, S.E.', jabatan: 'Bendahara' });
  });

  it('hasil strukturOrganisasi bertaut ke profil pegawai BUMDes', () => {
    expect(getDetailUrl({ type: 'strukturOrganisasi', id: 'peg-1', name: 'Ni Kadek Ayu, S.E.' })).toBe(
      '/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/peg-1',
    );
  });

  it('query kosong tidak membaca DB', async () => {
    expect(await searchFindMany(ctx({ query: '  ', type: 'strukturOrganisasi' }))).toEqual({ data: [], nextPage: null });
    expect(pegawai()).not.toHaveBeenCalled();
  });
});
