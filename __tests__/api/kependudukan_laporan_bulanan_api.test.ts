// @vitest-environment node
// API Laporan Penduduk Bulanan: validasi bulan/angka/tahun, duplikat aktif ditolak (409), soft delete,
// mutasi hanya admin (role 0-4), find-many publik terpaginasi + tersaring tahun/bulan/banjar. Prisma & sesi di-mock.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthMock, prismaMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  prismaMock: {
    laporanPendudukBulanan: {
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));
vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import laporanBulananCreate from '@/app/api/[[...slugs]]/_lib/kependudukan/laporan-bulanan/create';
import laporanBulananDelete from '@/app/api/[[...slugs]]/_lib/kependudukan/laporan-bulanan/del';
import laporanBulananFindMany from '@/app/api/[[...slugs]]/_lib/kependudukan/laporan-bulanan/findMany';
import laporanBulananFindUnique from '@/app/api/[[...slugs]]/_lib/kependudukan/laporan-bulanan/findUnique';
import Kependudukan from '@/app/api/[[...slugs]]/_lib/kependudukan';
import LaporanBulanan from '@/app/api/[[...slugs]]/_lib/kependudukan/laporan-bulanan';
import { PESAN_DUPLIKAT } from '@/app/api/[[...slugs]]/_lib/kependudukan/laporan-bulanan/laporan-bulanan.http';
import laporanBulananUpdate from '@/app/api/[[...slugs]]/_lib/kependudukan/laporan-bulanan/updt';
import {
  JUMLAH_MAX,
  TAHUN_MIN,
  parseLaporanInput,
  tahunMaks,
} from '@/app/api/[[...slugs]]/_lib/kependudukan/laporan-bulanan/laporan-bulanan.rules';

const L = prismaMock.laporanPendudukBulanan;
const TAHUN = new Date().getFullYear();
// test-only: isian rekaan
const body = { banjar: 'Banjar Contoh', tahun: TAHUN, bulan: 3, lakiLaki: 120, perempuan: 130 };
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context Elysia tiruan minimal
const ctx = (o: { params?: object; query?: object; body?: unknown } = {}): any => ({ params: {}, query: {}, set: {}, ...o });
const asRole = (roleId: string) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: `u-${roleId}`, roleId, isActive: true } });

beforeEach(() => {
  vi.resetAllMocks();
  asRole('2');
  L.findFirst.mockResolvedValue(null);
  L.create.mockResolvedValue({ id: 'lap1', ...body });
  L.update.mockResolvedValue({ id: 'lap1', ...body });
  L.updateMany.mockResolvedValue({ count: 1 });
  L.findMany.mockResolvedValue([]);
  L.count.mockResolvedValue(0);
});

describe('parseLaporanInput', () => {
  it('menerima isian valid dan merapikan nama banjar', () => {
    const r = parseLaporanInput({ ...body, banjar: '  Banjar   Contoh ' });
    expect(r).toEqual({ ok: true, data: body });
  });

  it.each([0, 13, -1, 1.5, '3', null, undefined])('menolak bulan %s', (bulan) => {
    const r = parseLaporanInput({ ...body, bulan });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain('Bulan harus bilangan bulat 1-12');
  });

  it.each([1, 12])('menerima bulan batas %i', (bulan) => {
    expect(parseLaporanInput({ ...body, bulan }).ok).toBe(true);
  });

  it('menolak tahun di luar rentang wajar atau bukan bilangan bulat', () => {
    for (const tahun of [TAHUN_MIN - 1, tahunMaks() + 1, 2026.5, '2026']) {
      expect(parseLaporanInput({ ...body, tahun }).ok, String(tahun)).toBe(false);
    }
    expect(parseLaporanInput({ ...body, tahun: TAHUN_MIN }).ok).toBe(true);
  });

  it.each(['lakiLaki', 'perempuan'])('menolak %s negatif, desimal, bukan angka, atau melebihi batas', (field) => {
    for (const v of [-1, 0.5, '10', null, JUMLAH_MAX + 1]) {
      expect(parseLaporanInput({ ...body, [field]: v }).ok, `${field}=${String(v)}`).toBe(false);
    }
    expect(parseLaporanInput({ ...body, [field]: 0 }).ok).toBe(true);
  });

  it('menolak nama banjar kosong/spasi dan yang terlalu panjang', () => {
    expect(parseLaporanInput({ ...body, banjar: '   ' }).ok).toBe(false);
    expect(parseLaporanInput({ ...body, banjar: 'x'.repeat(101) }).ok).toBe(false);
  });
});

describe('create', () => {
  it('menyimpan isian ternormalisasi dan membalas hanya kolom laporan', async () => {
    const res = await laporanBulananCreate(ctx({ body: { ...body, banjar: ' Banjar Contoh ' } }));
    expect(res).toMatchObject({ success: true });
    expect(L.create.mock.calls[0][0].data).toEqual(body);
    expect(Object.keys(L.create.mock.calls[0][0].select)).not.toContain('deletedAt');
  });

  it('400 untuk bulan/angka tidak valid tanpa menyentuh DB', async () => {
    const set: { status?: number } = {};
    const res = await laporanBulananCreate(ctx({ set, body: { ...body, bulan: 13 } }));
    expect(res).toMatchObject({ success: false });
    expect(set.status).toBe(400);
    expect(L.create).not.toHaveBeenCalled();
    expect(L.findFirst).not.toHaveBeenCalled();
  });

  it('409 bila sudah ada laporan aktif banjar+tahun+bulan yang sama (banjar tak peka huruf besar/kecil)', async () => {
    L.findFirst.mockResolvedValue({ id: 'sudah-ada' });
    const set: { status?: number } = {};
    const res = await laporanBulananCreate(ctx({ set, body }));
    expect(res).toEqual({ success: false, message: PESAN_DUPLIKAT });
    expect(set.status).toBe(409);
    expect(L.create).not.toHaveBeenCalled();
    expect(L.findFirst.mock.calls[0][0].where).toEqual({
      banjar: { equals: 'Banjar Contoh', mode: 'insensitive' },
      tahun: TAHUN,
      bulan: 3,
      isActive: true,
    });
  });
});

describe('update', () => {
  const params = { id: 'lap1' };

  it('404 bila laporan tidak ada/sudah dihapus', async () => {
    const set: { status?: number } = {};
    const res = await laporanBulananUpdate(ctx({ set, params, body }));
    expect(res).toMatchObject({ success: false });
    expect(set.status).toBe(404);
    expect(L.update).not.toHaveBeenCalled();
  });

  it('409 bila periode baru bentrok dengan laporan aktif LAIN; pengecekan mengecualikan dirinya sendiri', async () => {
    L.findFirst.mockResolvedValueOnce({ id: 'lap1' }).mockResolvedValueOnce({ id: 'lain' });
    const set: { status?: number } = {};
    const res = await laporanBulananUpdate(ctx({ set, params, body }));
    expect(res).toEqual({ success: false, message: PESAN_DUPLIKAT });
    expect(set.status).toBe(409);
    expect(L.findFirst.mock.calls[1][0].where.NOT).toEqual({ id: 'lap1' });
    expect(L.update).not.toHaveBeenCalled();
  });

  it('mengubah laporan bila lolos validasi', async () => {
    L.findFirst.mockResolvedValueOnce({ id: 'lap1' }).mockResolvedValueOnce(null);
    const res = await laporanBulananUpdate(ctx({ params, body: { ...body, lakiLaki: 150 } }));
    expect(res).toMatchObject({ success: true });
    expect(L.update.mock.calls[0][0]).toMatchObject({ where: { id: 'lap1' }, data: { ...body, lakiLaki: 150 } });
  });

  it('400 untuk angka negatif tanpa menyentuh DB', async () => {
    const set: { status?: number } = {};
    await laporanBulananUpdate(ctx({ set, params, body: { ...body, perempuan: -5 } }));
    expect(set.status).toBe(400);
    expect(L.findFirst).not.toHaveBeenCalled();
  });
});

describe('delete = soft delete', () => {
  it('menandai isActive=false + deletedAt, tidak menghapus baris', async () => {
    const res = await laporanBulananDelete(ctx({ params: { id: 'lap1' } }));
    expect(res).toMatchObject({ success: true });
    const arg = L.updateMany.mock.calls[0][0];
    expect(arg.where).toEqual({ id: 'lap1', isActive: true });
    expect(arg.data.isActive).toBe(false);
    expect(arg.data.deletedAt).toBeInstanceOf(Date);
  });

  it('404 bila laporan tidak ada atau sudah dihapus', async () => {
    L.updateMany.mockResolvedValue({ count: 0 });
    const set: { status?: number } = {};
    await laporanBulananDelete(ctx({ set, params: { id: 'x' } }));
    expect(set.status).toBe(404);
  });
});

describe('mutasi hanya admin', () => {
  const mutasi = [
    ['create', () => laporanBulananCreate, { body }],
    ['updt', () => laporanBulananUpdate, { params: { id: 'lap1' }, body }],
    ['del', () => laporanBulananDelete, { params: { id: 'lap1' } }],
  ] as const;

  it.each(mutasi)('%s: 403 untuk user biasa (role 5), tidak menyentuh DB', async (_n, handler, input) => {
    asRole('5');
    const set: { status?: number } = {};
    const res = await handler()(ctx({ set, ...input }));
    expect(res).toMatchObject({ success: false });
    expect(set.status).toBe(403);
    for (const fn of Object.values(L)) expect(fn).not.toHaveBeenCalled();
  });

  it.each(mutasi)('%s: 401 tanpa sesi', async (_n, handler, input) => {
    requireAuthMock.mockResolvedValue({
      authenticated: false,
      response: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 }),
    });
    const set: { status?: number } = {};
    await handler()(ctx({ set, ...input }));
    expect(set.status).toBe(401);
    for (const fn of Object.values(L)) expect(fn).not.toHaveBeenCalled();
  });

  it.each(['0', '1', '2', '3', '4'])('role admin %s boleh menambah', async (role) => {
    asRole(role);
    expect(await laporanBulananCreate(ctx({ body }))).toMatchObject({ success: true });
  });
});

describe('find-many (publik)', () => {
  it('tanpa cek sesi; hanya laporan aktif, urut terbaru, tanpa filter bila tak diminta', async () => {
    requireAuthMock.mockRejectedValue(new Error('tidak boleh dipanggil'));
    L.findMany.mockResolvedValue([{ id: 'a' }]);
    L.count.mockResolvedValue(1);
    const res = await laporanBulananFindMany(ctx());
    expect(res).toMatchObject({ success: true, data: [{ id: 'a' }], page: 1, total: 1, totalPages: 1 });
    expect(L.findMany.mock.calls[0][0].where).toEqual({ isActive: true });
    expect(L.findMany.mock.calls[0][0].orderBy).toEqual([{ tahun: 'desc' }, { bulan: 'desc' }, { banjar: 'asc' }]);
    expect(requireAuthMock).not.toHaveBeenCalled();
  });

  it('menyaring tahun, bulan, dan banjar; paginasi memakai skip/take', async () => {
    L.count.mockResolvedValue(45);
    const res = await laporanBulananFindMany(
      ctx({ query: { tahun: '2026', bulan: '3', banjar: ' Tengah ', page: '2', limit: '20' } }),
    );
    const arg = L.findMany.mock.calls[0][0];
    expect(arg.where).toEqual({ isActive: true, tahun: 2026, bulan: 3, banjar: { contains: 'Tengah', mode: 'insensitive' } });
    expect(arg.skip).toBe(20);
    expect(arg.take).toBe(20);
    expect(res).toMatchObject({ page: 2, totalPages: 3, total: 45 });
  });

  it('limit dibatasi maksimum 100', async () => {
    await laporanBulananFindMany(ctx({ query: { limit: '5000' } }));
    expect(L.findMany.mock.calls[0][0].take).toBe(100);
  });

  it.each([{ bulan: '13' }, { bulan: 'abc' }, { tahun: '1' }, { tahun: 'x' }])('400 untuk filter tidak valid %o', async (query) => {
    const set: { status?: number } = {};
    const res = await laporanBulananFindMany(ctx({ set, query }));
    expect(res).toMatchObject({ success: false });
    expect(set.status).toBe(400);
    expect(L.findMany).not.toHaveBeenCalled();
  });

  it('select hanya kolom agregat (tanpa deletedAt/isActive)', async () => {
    await laporanBulananFindMany(ctx());
    expect(Object.keys(L.findMany.mock.calls[0][0].select).sort()).toEqual(
      ['banjar', 'bulan', 'createdAt', 'id', 'lakiLaki', 'perempuan', 'tahun', 'updatedAt'],
    );
  });
});

describe('find-unique (publik)', () => {
  it('404 untuk laporan yang tidak ada atau sudah dihapus (hanya isActive)', async () => {
    const set: { status?: number } = {};
    const res = await laporanBulananFindUnique(ctx({ set, params: { id: 'x' } }));
    expect(res).toMatchObject({ success: false });
    expect(set.status).toBe(404);
    expect(L.findFirst.mock.calls[0][0].where).toEqual({ id: 'x', isActive: true });
  });

  it('mengembalikan laporan aktif', async () => {
    L.findFirst.mockResolvedValue({ id: 'lap1', ...body });
    expect(await laporanBulananFindUnique(ctx({ params: { id: 'lap1' } }))).toMatchObject({ success: true, data: { id: 'lap1' } });
  });
});

describe('routing', () => {
  it('rute terdaftar dengan prefix /laporanbulanan', () => {
    const routes = LaporanBulanan.routes.map((r) => `${r.method} ${r.path}`);
    expect(routes).toEqual(
      expect.arrayContaining([
        'GET /laporanbulanan/find-many',
        'GET /laporanbulanan/:id',
        'POST /laporanbulanan/create',
        'PUT /laporanbulanan/:id',
        'DELETE /laporanbulanan/del/:id',
      ]),
    );
  });

  it('terpasang di router Kependudukan, DataBanjar tetap ada', () => {
    const routes = Kependudukan.routes.map((r) => `${r.method} ${r.path}`);
    expect(routes).toContain('GET /kependudukan/laporanbulanan/find-many');
    expect(routes).toContain('GET /kependudukan/databanjar/find-many');
  });
});
