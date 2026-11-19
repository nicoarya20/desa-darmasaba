// @vitest-environment node
// Indeks Desa (IDM): API /desa/indeksdesa. Modul Elysia diuji lewat app.handle dengan prisma dan guard sesi di-mock:
// GET publik hanya yang aktif + tahun menurun + limit dibatasi; create/updt/del hanya admin (401/403), validasi skor 0-1,
// status resmi, tahun ganda → 400 (juga saat balapan indeks unik), dan tidak ada kolom bookkeeping di respons.
import { Prisma } from '@prisma/client';
import Elysia from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthMock, indeks, prismaMock } = vi.hoisted(() => {
  const indeks = {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return { requireAuthMock: vi.fn(), indeks, prismaMock: { indeksDesa: indeks } };
});
vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import IndeksDesa from '@/app/api/[[...slugs]]/_lib/desa/indeks-desa';
import { INDEKS_DESA_SELECT } from '@/app/api/[[...slugs]]/_lib/desa/indeks-desa/find-many';
import {
  PESAN_ADMIN_INDEKS_DESA,
  PESAN_INDEKS_DESA_TAHUN_SUDAH_ADA,
  PESAN_INDEKS_DESA_TIDAK_ADA,
} from '@/app/api/[[...slugs]]/_lib/desa/indeks-desa/indeks-desa.guard';
import { isPublicPostPath } from '@/lib/auth-policy';
import { INDEKS_DESA_MAX_LIMIT, PESAN_INDEKS_DESA, STATUS_IDM } from '@/lib/indeks-desa';

const app = new Elysia({ prefix: '/api/desa' }).use(IndeksDesa);
const BASE = 'http://localhost/api/desa/indeksdesa';
const send = (method: string, path: string, body?: unknown) =>
  app.handle(
    new Request(`${BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );

const asRole = (roleId: string) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: `u-${roleId}`, roleId, isActive: true } });
const noSession = (status: number) =>
  requireAuthMock.mockResolvedValue({
    authenticated: false,
    response: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status }),
  });

// test-only: angka rekaan untuk menguji bentuk dan aturan, bukan data IDM Desa Darmasaba.
const INPUT = { tahun: 2030, skorIdm: 0.5, skorIks: 0.4, skorIke: 0.6, skorIkl: 0.7, status: 'Maju', catatan: null }; // test-only
const ROW = { id: 'idm-1', ...INPUT }; // test-only
const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: 'test' });

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  asRole('2');
});

describe('GET /find-many (publik)', () => {
  it('hanya aktif, tanpa sesi, tahun menurun, select tanpa kolom bookkeeping', async () => {
    indeks.findMany.mockResolvedValue([ROW]);
    indeks.count.mockResolvedValue(1);
    const res = await send('GET', '/find-many');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: [ROW], page: 1, limit: 10, total: 1, totalPages: 1 });
    expect(requireAuthMock).not.toHaveBeenCalled();
    const arg = indeks.findMany.mock.calls[0][0];
    expect(arg.where).toEqual({ isActive: true, deletedAt: null });
    expect(arg.orderBy).toEqual([{ tahun: 'desc' }]);
    expect(arg.select).toBe(INDEKS_DESA_SELECT);
    expect(Object.keys(INDEKS_DESA_SELECT).sort()).toEqual(
      ['catatan', 'id', 'skorIdm', 'skorIke', 'skorIkl', 'skorIks', 'status', 'tahun'],
    );
    expect(indeks.count).toHaveBeenCalledWith({ where: { isActive: true, deletedAt: null } });
  });

  it('limit dibatasi, page menghitung skip, totalPages dari total', async () => {
    indeks.findMany.mockResolvedValue([]);
    indeks.count.mockResolvedValue(250);
    const res = await send('GET', '/find-many?page=2&limit=9999');
    const arg = indeks.findMany.mock.calls[0][0];
    expect([arg.skip, arg.take]).toEqual([INDEKS_DESA_MAX_LIMIT, INDEKS_DESA_MAX_LIMIT]);
    expect(await res.json()).toMatchObject({ page: 2, limit: INDEKS_DESA_MAX_LIMIT, total: 250, totalPages: 3 });
  });

  it('page/limit tidak valid kembali ke bawaan (halaman 1, 10 baris)', async () => {
    indeks.findMany.mockResolvedValue([]);
    indeks.count.mockResolvedValue(0);
    await send('GET', '/find-many?page=abc&limit=-5');
    const arg = indeks.findMany.mock.calls[0][0];
    expect([arg.skip, arg.take]).toEqual([0, 10]);
  });

  it('galat DB → 500 berpesan jelas dan galat dicatat', async () => {
    indeks.findMany.mockRejectedValue(new Error('db down'));
    indeks.count.mockResolvedValue(0);
    const res = await send('GET', '/find-many');
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ success: false, message: 'Gagal mengambil daftar Indeks Desa' });
    expect(console.error).toHaveBeenCalled();
  });
});

describe('GET /:id (publik)', () => {
  it('mengembalikan baris aktif tanpa sesi', async () => {
    indeks.findFirst.mockResolvedValue(ROW);
    const res = await send('GET', '/idm-1');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: ROW });
    expect(indeks.findFirst).toHaveBeenCalledWith({
      where: { id: 'idm-1', isActive: true, deletedAt: null },
      select: INDEKS_DESA_SELECT,
    });
    expect(requireAuthMock).not.toHaveBeenCalled();
  });

  it('tidak ada/nonaktif → 404', async () => {
    indeks.findFirst.mockResolvedValue(null);
    const res = await send('GET', '/x');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ success: false, message: PESAN_INDEKS_DESA_TIDAK_ADA });
  });
});

describe('kebijakan auth global (src/lib/auth-policy.ts)', () => {
  it('mutasi Indeks Desa tidak masuk daftar POST publik, sehingga route.ts mewajibkan sesi', () => {
    for (const path of ['create', 'updt/idm-1', 'del/idm-1']) {
      expect(isPublicPostPath(`/api/desa/indeksdesa/${path}`)).toBe(false);
    }
  });
});

describe('guard admin (semua mutasi)', () => {
  const mutasi: [string, string, unknown][] = [
    ['POST', '/create', INPUT],
    ['PUT', '/updt/idm-1', INPUT],
    ['DELETE', '/del/idm-1', undefined],
  ];
  const tidakMenulis = () => {
    expect(indeks.create).not.toHaveBeenCalled();
    expect(indeks.update).not.toHaveBeenCalled();
    expect(indeks.delete).not.toHaveBeenCalled();
  };

  it.each(mutasi)('%s %s tanpa sesi → 401, tanpa menyentuh DB', async (method, path, body) => {
    noSession(401);
    const res = await send(method, path, body);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ success: false, message: 'Unauthorized' });
    tidakMenulis();
  });

  it.each(mutasi)('%s %s akun role 5 (bukan admin) → 403, tanpa menyentuh DB', async (method, path, body) => {
    asRole('5');
    const res = await send(method, path, body);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ success: false, message: PESAN_ADMIN_INDEKS_DESA });
    tidakMenulis();
  });

  it.each(['0', '1', '2', '3', '4'])('role %s (admin) lolos guard', async (role) => {
    asRole(role);
    indeks.findUnique.mockResolvedValue(null);
    expect((await send('DELETE', '/del/x')).status).toBe(404);
  });
});

describe('POST /create', () => {
  it('menyimpan input yang sah (catatan dirapikan) dan mengembalikan baris', async () => {
    indeks.findFirst.mockResolvedValue(null);
    indeks.create.mockResolvedValue(ROW);
    const res = await send('POST', '/create', { ...INPUT, catatan: '  Dari   dokumen  Kemendesa ' });
    expect(res.status).toBe(200);
    expect(indeks.create).toHaveBeenCalledWith({
      data: { ...INPUT, catatan: 'Dari dokumen Kemendesa' },
      select: INDEKS_DESA_SELECT,
    });
    expect(await res.json()).toMatchObject({ success: true, data: ROW });
  });

  it('batas skor 0 dan 1 diterima', async () => {
    indeks.findFirst.mockResolvedValue(null);
    indeks.create.mockResolvedValue(ROW);
    const res = await send('POST', '/create', { ...INPUT, skorIdm: 0, skorIks: 1 });
    expect(res.status).toBe(200);
  });

  it.each([
    ['skorIdm', 1.01, 'Skor IDM'],
    ['skorIks', -0.1, 'Skor IKS'],
    ['skorIke', 2, 'Skor IKE'],
    ['skorIkl', -1, 'Skor IKL'],
  ])('%s=%s di luar 0-1 → 400 tanpa menyimpan', async (field, value, label) => {
    const res = await send('POST', '/create', { ...INPUT, [field]: value });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_INDEKS_DESA.skorTidakValid(label) });
    expect(indeks.create).not.toHaveBeenCalled();
  });

  it.each(['mandiri', 'Sangat Maju', ''])('status tak dikenal "%s" → 400', async (status) => {
    const res = await send('POST', '/create', { ...INPUT, status });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_INDEKS_DESA.statusTidakValid });
    expect(indeks.create).not.toHaveBeenCalled();
  });

  it.each(STATUS_IDM)('status resmi "%s" diterima', async (status) => {
    indeks.findFirst.mockResolvedValue(null);
    indeks.create.mockResolvedValue(ROW);
    expect((await send('POST', '/create', { ...INPUT, status })).status).toBe(200);
  });

  it.each([1999, 2101, 2030.5])('tahun %s tidak wajar → 400', async (tahun) => {
    const res = await send('POST', '/create', { ...INPUT, tahun });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_INDEKS_DESA.tahunTidakValid });
    expect(indeks.create).not.toHaveBeenCalled();
  });

  it('catatan memuat tanda < atau > → 400', async () => {
    const res = await send('POST', '/create', { ...INPUT, catatan: '<b>x</b>' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_INDEKS_DESA.catatanBukanTeksPolos });
  });

  it('tahun sudah punya data → 400 tanpa menyimpan', async () => {
    indeks.findFirst.mockResolvedValue({ id: 'lain' });
    const res = await send('POST', '/create', INPUT);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_INDEKS_DESA_TAHUN_SUDAH_ADA });
    expect(indeks.findFirst).toHaveBeenCalledWith({ where: { tahun: INPUT.tahun }, select: { id: true } });
    expect(indeks.create).not.toHaveBeenCalled();
  });

  it('balapan dua admin (indeks unik menolak) → 400, bukan 500', async () => {
    indeks.findFirst.mockResolvedValue(null);
    indeks.create.mockRejectedValue(uniqueViolation());
    const res = await send('POST', '/create', INPUT);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_INDEKS_DESA_TAHUN_SUDAH_ADA });
  });

  it('galat DB lain tidak ditelan → 500', async () => {
    indeks.findFirst.mockResolvedValue(null);
    indeks.create.mockRejectedValue(new Error('db down'));
    expect((await send('POST', '/create', INPUT)).status).toBe(500);
  });
});

describe('PUT /updt/:id', () => {
  it('mengubah baris; pemeriksaan tahun ganda mengecualikan baris itu sendiri', async () => {
    indeks.findFirst.mockResolvedValueOnce({ id: 'idm-1' }).mockResolvedValueOnce(null);
    indeks.update.mockResolvedValue(ROW);
    const res = await send('PUT', '/updt/idm-1', INPUT);
    expect(res.status).toBe(200);
    expect(indeks.findFirst).toHaveBeenNthCalledWith(2, {
      where: { tahun: INPUT.tahun, NOT: { id: 'idm-1' } },
      select: { id: true },
    });
    expect(indeks.update).toHaveBeenCalledWith({ where: { id: 'idm-1' }, data: INPUT, select: INDEKS_DESA_SELECT });
  });

  it('id tidak ada → 404', async () => {
    indeks.findFirst.mockResolvedValueOnce(null);
    const res = await send('PUT', '/updt/x', INPUT);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ success: false, message: PESAN_INDEKS_DESA_TIDAK_ADA });
    expect(indeks.update).not.toHaveBeenCalled();
  });

  it('ganti ke tahun yang dipakai baris lain → 400', async () => {
    indeks.findFirst.mockResolvedValueOnce({ id: 'idm-1' }).mockResolvedValueOnce({ id: 'lain' });
    const res = await send('PUT', '/updt/idm-1', INPUT);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_INDEKS_DESA_TAHUN_SUDAH_ADA });
    expect(indeks.update).not.toHaveBeenCalled();
  });

  it('skor di luar 0-1 → 400 sebelum menyentuh DB', async () => {
    const res = await send('PUT', '/updt/idm-1', { ...INPUT, skorIdm: 5 });
    expect(res.status).toBe(400);
    expect(indeks.findFirst).not.toHaveBeenCalled();
  });

  it('balapan indeks unik saat simpan → 400', async () => {
    indeks.findFirst.mockResolvedValueOnce({ id: 'idm-1' }).mockResolvedValueOnce(null);
    indeks.update.mockRejectedValue(uniqueViolation());
    const res = await send('PUT', '/updt/idm-1', INPUT);
    expect(res.status).toBe(400);
  });
});

describe('DELETE /del/:id', () => {
  it('menghapus baris yang ada', async () => {
    indeks.findUnique.mockResolvedValue({ id: 'idm-1' });
    const res = await send('DELETE', '/del/idm-1');
    expect(res.status).toBe(200);
    expect(indeks.delete).toHaveBeenCalledWith({ where: { id: 'idm-1' } });
  });

  it('id tidak ada → 404 tanpa menghapus', async () => {
    indeks.findUnique.mockResolvedValue(null);
    const res = await send('DELETE', '/del/x');
    expect(res.status).toBe(404);
    expect(indeks.delete).not.toHaveBeenCalled();
  });
});
