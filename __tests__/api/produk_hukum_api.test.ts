// @vitest-environment node
// Produk Hukum (Pemerintahan): API /desa/produkhukum. Modul Elysia diuji lewat app.handle dengan prisma, guard sesi,
// dan penghapus berkas di-mock: GET publik hanya yang aktif + filter kategori/q + limit dibatasi; create/updt/reorder/
// del hanya admin (401/403), validasi input, urutan otomatis, reorder satu transaksi, dan hapus berkas SESUDAH baris.
import Elysia from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthMock, produk, fileStorage, prismaMock, removeStoredFile } = vi.hoisted(() => {
  const produk = {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const fileStorage = { findUnique: vi.fn() };
  return {
    requireAuthMock: vi.fn(),
    produk,
    fileStorage,
    removeStoredFile: vi.fn(),
    prismaMock: {
      produkHukum: produk,
      fileStorage,
      $transaction: vi.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
    },
  };
});
vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile', () => ({ default: removeStoredFile }));

import ProdukHukum from '@/app/api/[[...slugs]]/_lib/desa/produk-hukum';
import {
  PESAN_ADMIN_PRODUK_HUKUM,
  PESAN_PRODUK_HUKUM_TIDAK_ADA,
  PESAN_URUTAN_PRODUK_HUKUM_TIDAK_VALID,
} from '@/app/api/[[...slugs]]/_lib/desa/produk-hukum/produk-hukum.guard';
import { PRODUK_HUKUM_SELECT } from '@/app/api/[[...slugs]]/_lib/desa/produk-hukum/find-many';
import { PESAN_FILE_PPID_TIDAK_ADA } from '@/app/api/[[...slugs]]/_lib/ppid/ppid-file';
import { isPublicPostPath } from '@/lib/auth-policy';
import {
  JUDUL_PRODUK_HUKUM_MAX,
  PESAN_PRODUK_HUKUM,
  PRODUK_HUKUM_MAX_LIMIT,
  PRODUK_HUKUM_SEARCH_MAX,
} from '@/lib/produk-hukum';

const app = new Elysia({ prefix: '/api/desa' }).use(ProdukHukum);
const BASE = 'http://localhost/api/desa/produkhukum';
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
// test-only: berkas dan baris rekaan.
const FILE = { id: 'file-1', link: '/api/fileStorage/findUnique/perdes.pdf', realName: 'perdes.pdf' };
const ROW = { id: 'ph-1', judul: 'Perdes 9', nomor: 'Nomor 9 Tahun 2021', tahun: 2021, kategori: 'PERDES', file: FILE };
const orderOf = (fn: ReturnType<typeof vi.fn>) => fn.mock.invocationCallOrder[0];

beforeEach(() => {
  vi.resetAllMocks();
  prismaMock.$transaction.mockImplementation(async (ops: Promise<unknown>[]) => Promise.all(ops));
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  asRole('2');
});

describe('GET /find-many (publik)', () => {
  it('hanya aktif, tanpa perlu sesi; select tanpa data lain; urut tahun menurun lalu urutan', async () => {
    produk.findMany.mockResolvedValue([ROW]);
    produk.count.mockResolvedValue(1);
    const res = await send('GET', '/find-many');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: [ROW], page: 1, limit: 10, total: 1, totalPages: 1 });
    expect(requireAuthMock).not.toHaveBeenCalled();
    const arg = produk.findMany.mock.calls[0][0];
    expect(arg.where).toEqual({ isActive: true, deletedAt: null });
    expect(arg.orderBy).toEqual([{ tahun: { sort: 'desc', nulls: 'last' } }, { urutan: 'asc' }, { createdAt: 'asc' }]);
    expect(arg.select).toBe(PRODUK_HUKUM_SELECT);
    expect(Object.keys(PRODUK_HUKUM_SELECT).sort()).toEqual(['file', 'id', 'judul', 'kategori', 'nomor', 'tahun']);
  });

  it('filter kategori dan q (judul/nomor, tanpa beda huruf) masuk ke where; count memakai where yang sama', async () => {
    produk.findMany.mockResolvedValue([]);
    produk.count.mockResolvedValue(0);
    await send('GET', '/find-many?kategori=SK_PERBEKEL&q=%20anggaran%20');
    const { where } = produk.findMany.mock.calls[0][0];
    expect(where).toEqual({
      isActive: true,
      deletedAt: null,
      kategori: 'SK_PERBEKEL',
      OR: [
        { judul: { contains: 'anggaran', mode: 'insensitive' } },
        { nomor: { contains: 'anggaran', mode: 'insensitive' } },
      ],
    });
    expect(produk.count).toHaveBeenCalledWith({ where });
  });

  it('kategori tak sah → 400 tanpa query DB', async () => {
    const res = await send('GET', '/find-many?kategori=UU');
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_PRODUK_HUKUM.kategoriTidakValid });
    expect(produk.findMany).not.toHaveBeenCalled();
  });

  it('limit dibatasi, q dipotong, page menghitung skip; totalPages dari total', async () => {
    produk.findMany.mockResolvedValue([]);
    produk.count.mockResolvedValue(95);
    const res = await send('GET', `/find-many?page=3&limit=9999&q=${'a'.repeat(PRODUK_HUKUM_SEARCH_MAX + 50)}`);
    const arg = produk.findMany.mock.calls[0][0];
    expect(arg.take).toBe(PRODUK_HUKUM_MAX_LIMIT);
    expect(arg.skip).toBe(2 * PRODUK_HUKUM_MAX_LIMIT);
    expect(arg.where.OR[0].judul.contains).toHaveLength(PRODUK_HUKUM_SEARCH_MAX);
    expect(await res.json()).toMatchObject({ page: 3, limit: PRODUK_HUKUM_MAX_LIMIT, total: 95, totalPages: 2 });
  });

  it('page/limit tidak valid kembali ke bawaan (1 dan 10)', async () => {
    produk.findMany.mockResolvedValue([]);
    produk.count.mockResolvedValue(0);
    await send('GET', '/find-many?page=abc&limit=-5');
    const arg = produk.findMany.mock.calls[0][0];
    expect([arg.skip, arg.take]).toEqual([0, 10]);
  });

  it('galat DB → 500 berpesan jelas, galat dicatat berkonteks', async () => {
    produk.findMany.mockRejectedValue(new Error('db down'));
    produk.count.mockResolvedValue(0);
    const res = await send('GET', '/find-many');
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ success: false, message: 'Gagal mengambil daftar produk hukum' });
    expect(console.error).toHaveBeenCalled();
  });
});

describe('kebijakan auth global (src/lib/auth-policy.ts)', () => {
  it('mutasi produk hukum tidak masuk daftar POST publik, sehingga route.ts mewajibkan sesi', () => {
    for (const path of ['create', 'updt/ph-1', 'reorder', 'del/ph-1']) {
      expect(isPublicPostPath(`/api/desa/produkhukum/${path}`)).toBe(false);
    }
  });
});

describe('GET /:id (publik)', () => {
  it('mengembalikan entri aktif tanpa sesi', async () => {
    produk.findFirst.mockResolvedValue(ROW);
    const res = await send('GET', '/ph-1');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: ROW });
    expect(produk.findFirst).toHaveBeenCalledWith({
      where: { id: 'ph-1', isActive: true, deletedAt: null },
      select: PRODUK_HUKUM_SELECT,
    });
    expect(requireAuthMock).not.toHaveBeenCalled();
  });

  it('tidak ada/nonaktif → 404', async () => {
    produk.findFirst.mockResolvedValue(null);
    const res = await send('GET', '/x');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ success: false, message: PESAN_PRODUK_HUKUM_TIDAK_ADA });
  });
});

describe('guard admin (semua mutasi)', () => {
  const mutasi: [string, string, unknown][] = [
    ['POST', '/create', { judul: 'A', kategori: 'PERDES' }],
    ['PUT', '/updt/ph-1', { judul: 'B', kategori: 'PERDES' }],
    ['PUT', '/reorder', { ids: ['ph-1'] }],
    ['DELETE', '/del/ph-1', undefined],
  ];
  const tidakMenulis = () => {
    expect(produk.create).not.toHaveBeenCalled();
    expect(produk.update).not.toHaveBeenCalled();
    expect(produk.delete).not.toHaveBeenCalled();
    expect(removeStoredFile).not.toHaveBeenCalled();
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
    expect(await res.json()).toEqual({ success: false, message: PESAN_ADMIN_PRODUK_HUKUM });
    tidakMenulis();
  });

  it.each(['0', '1', '2', '3', '4'])('role %s (admin) lolos guard', async (role) => {
    asRole(role);
    produk.findUnique.mockResolvedValue(null);
    expect((await send('DELETE', '/del/x')).status).toBe(404);
  });
});

describe('POST /create', () => {
  it('menyimpan input rapi + fileId, urutan = terakhir + 1', async () => {
    fileStorage.findUnique.mockResolvedValue({ id: FILE.id });
    produk.aggregate.mockResolvedValue({ _max: { urutan: 4 } });
    produk.create.mockResolvedValue(ROW);
    const res = await send('POST', '/create', {
      judul: '  Perdes   9 ',
      nomor: 'Nomor 9 Tahun 2021',
      tahun: 2021,
      kategori: 'PERDES',
      fileId: FILE.id,
    });
    expect(res.status).toBe(200);
    expect(produk.create).toHaveBeenCalledWith({
      data: { judul: 'Perdes 9', nomor: 'Nomor 9 Tahun 2021', tahun: 2021, kategori: 'PERDES', fileId: FILE.id, urutan: 5 },
      select: PRODUK_HUKUM_SELECT,
    });
  });

  it('tanpa berkas boleh: fileId null, entri pertama urutan 0', async () => {
    produk.aggregate.mockResolvedValue({ _max: { urutan: null } });
    produk.create.mockResolvedValue({ ...ROW, file: null });
    const res = await send('POST', '/create', { judul: 'SK Baru', kategori: 'SK_PERBEKEL' });
    expect(res.status).toBe(200);
    expect(produk.create.mock.calls[0][0].data).toEqual({
      judul: 'SK Baru',
      nomor: null,
      tahun: null,
      kategori: 'SK_PERBEKEL',
      fileId: null,
      urutan: 0,
    });
    expect(fileStorage.findUnique).not.toHaveBeenCalled();
  });

  it.each([
    ['judul kosong', { judul: ' ', kategori: 'PERDES' }, PESAN_PRODUK_HUKUM.judulKosong],
    ['judul > 255', { judul: 'x'.repeat(JUDUL_PRODUK_HUKUM_MAX + 1), kategori: 'PERDES' }, PESAN_PRODUK_HUKUM.judulPanjang],
    ['tahun di luar rentang', { judul: 'A', kategori: 'PERDES', tahun: 1899 }, PESAN_PRODUK_HUKUM.tahunTidakValid],
    ['kategori tak sah', { judul: 'A', kategori: 'UU' }, PESAN_PRODUK_HUKUM.kategoriTidakValid],
  ])('menolak %s (400), tidak menulis apa pun', async (_nama, body, message) => {
    const res = await send('POST', '/create', body);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message });
    expect(produk.create).not.toHaveBeenCalled();
  });

  it('menolak fileId yang tidak ada di FileStorage (400)', async () => {
    fileStorage.findUnique.mockResolvedValue(null);
    const res = await send('POST', '/create', { judul: 'A', kategori: 'PERDES', fileId: 'tidak-ada' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_FILE_PPID_TIDAK_ADA });
    expect(produk.create).not.toHaveBeenCalled();
  });

  it('body tanpa kategori ditolak kontrak body (422)', async () => {
    expect((await send('POST', '/create', { judul: 'A' })).status).toBe(422);
    expect(produk.create).not.toHaveBeenCalled();
  });
});

describe('PUT /updt/:id', () => {
  const body = { judul: ' Judul  Baru ', nomor: 'Nomor 1', tahun: 2022, kategori: 'LAINNYA' };

  it('mengubah kolom teks dan membiarkan berkas bila fileId tidak dikirim', async () => {
    produk.findFirst.mockResolvedValue({ id: 'ph-1', fileId: FILE.id });
    produk.update.mockResolvedValue(ROW);
    const res = await send('PUT', '/updt/ph-1', body);
    expect(res.status).toBe(200);
    expect(produk.update).toHaveBeenCalledWith({
      where: { id: 'ph-1' },
      data: { judul: 'Judul Baru', nomor: 'Nomor 1', tahun: 2022, kategori: 'LAINNYA' },
      select: PRODUK_HUKUM_SELECT,
    });
    expect(removeStoredFile).not.toHaveBeenCalled();
  });

  it('mengganti berkas: baris diperbarui DULU, baru berkas lama dihapus', async () => {
    produk.findFirst.mockResolvedValue({ id: 'ph-1', fileId: FILE.id });
    fileStorage.findUnique.mockResolvedValue({ id: 'file-2' });
    produk.update.mockResolvedValue(ROW);
    const res = await send('PUT', '/updt/ph-1', { ...body, fileId: 'file-2' });
    expect(res.status).toBe(200);
    expect(produk.update.mock.calls[0][0].data.fileId).toBe('file-2');
    expect(removeStoredFile).toHaveBeenCalledWith({ id: FILE.id }, 'ProdukHukum');
    expect(orderOf(removeStoredFile)).toBeGreaterThan(orderOf(produk.update));
  });

  it('fileId null melepas berkas lalu menghapus berkas lama; fileId sama tidak menghapus apa pun', async () => {
    produk.findFirst.mockResolvedValue({ id: 'ph-1', fileId: FILE.id });
    produk.update.mockResolvedValue(ROW);
    await send('PUT', '/updt/ph-1', { ...body, fileId: null });
    expect(produk.update.mock.calls[0][0].data.fileId).toBeNull();
    expect(removeStoredFile).toHaveBeenCalledWith({ id: FILE.id }, 'ProdukHukum');

    removeStoredFile.mockClear();
    fileStorage.findUnique.mockResolvedValue({ id: FILE.id });
    await send('PUT', '/updt/ph-1', { ...body, fileId: FILE.id });
    expect(removeStoredFile).not.toHaveBeenCalled();
  });

  it('input tidak valid → 400; id tidak ada → 404; fileId asing → 400; tak satu pun menulis', async () => {
    expect((await send('PUT', '/updt/ph-1', { ...body, kategori: 'UU' })).status).toBe(400);

    produk.findFirst.mockResolvedValue(null);
    const missing = await send('PUT', '/updt/x', body);
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ success: false, message: PESAN_PRODUK_HUKUM_TIDAK_ADA });

    produk.findFirst.mockResolvedValue({ id: 'ph-1', fileId: null });
    fileStorage.findUnique.mockResolvedValue(null);
    expect((await send('PUT', '/updt/ph-1', { ...body, fileId: 'asing' })).status).toBe(400);
    expect(produk.update).not.toHaveBeenCalled();
    expect(removeStoredFile).not.toHaveBeenCalled();
  });
});

describe('PUT /reorder', () => {
  it('menulis urutan 0..n-1 sesuai daftar id dalam satu transaksi', async () => {
    produk.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    produk.update.mockImplementation((arg: { where: { id: string } }) => Promise.resolve(arg));
    const res = await send('PUT', '/reorder', { ids: ['c', 'a', 'b'] });
    expect(res.status).toBe(200);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.$transaction.mock.calls[0][0]).toHaveLength(3);
    expect(produk.update.mock.calls.map(([arg]) => [arg.where.id, arg.data.urutan])).toEqual([
      ['c', 0],
      ['a', 1],
      ['b', 2],
    ]);
  });

  it('id tidak dikenal atau berulang → 400, tidak ada transaksi; daftar kosong → 422', async () => {
    produk.findMany.mockResolvedValue([{ id: 'a' }]);
    for (const ids of [['a', 'asing'], ['a', 'a']]) {
      const res = await send('PUT', '/reorder', { ids });
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ success: false, message: PESAN_URUTAN_PRODUK_HUKUM_TIDAK_VALID });
    }
    expect((await send('PUT', '/reorder', { ids: [] })).status).toBe(422);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(produk.update).not.toHaveBeenCalled();
  });
});

describe('DELETE /del/:id', () => {
  it('menghapus baris DULU, baru berkas FileStorage-nya', async () => {
    produk.findUnique.mockResolvedValue({ id: 'ph-1', fileId: FILE.id });
    const res = await send('DELETE', '/del/ph-1');
    expect(res.status).toBe(200);
    expect(produk.delete).toHaveBeenCalledWith({ where: { id: 'ph-1' } });
    expect(removeStoredFile).toHaveBeenCalledWith({ id: FILE.id }, 'ProdukHukum');
    expect(orderOf(removeStoredFile)).toBeGreaterThan(orderOf(produk.delete));
  });

  it('entri tanpa berkas: hanya baris yang dihapus', async () => {
    produk.findUnique.mockResolvedValue({ id: 'ph-1', fileId: null });
    expect((await send('DELETE', '/del/ph-1')).status).toBe(200);
    expect(produk.delete).toHaveBeenCalledTimes(1);
    expect(removeStoredFile).not.toHaveBeenCalled();
  });

  it('id tidak ada → 404, berkas tidak disentuh', async () => {
    produk.findUnique.mockResolvedValue(null);
    const res = await send('DELETE', '/del/x');
    expect(res.status).toBe(404);
    expect(produk.delete).not.toHaveBeenCalled();
    expect(removeStoredFile).not.toHaveBeenCalled();
  });
});
