// @vitest-environment node
// Lomba 2.5: API dokumen Dasar Hukum PPID (daftar flat, banyak PDF). Modul Elysia diuji lewat app.handle dengan
// prisma, guard sesi, dan penghapus berkas di-mock: GET publik hanya yang aktif & terurut; create/updt/reorder/del
// hanya admin (401/403), validasi judul/fileId, urutan otomatis, reorder dalam satu transaksi, dan hapus berkas
// SESUDAH baris (urutan aman dari bug FK Maskot).
import Elysia from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthMock, dokumen, fileStorage, prismaMock, removeStoredFile } = vi.hoisted(() => {
  const dokumen = {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    aggregate: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const fileStorage = { findUnique: vi.fn() };
  return {
    requireAuthMock: vi.fn(),
    dokumen,
    fileStorage,
    removeStoredFile: vi.fn(),
    prismaMock: {
      dokumenDasarHukumPPID: dokumen,
      fileStorage,
      $transaction: vi.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
    },
  };
});
vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile', () => ({ default: removeStoredFile }));

import DasarHukumPPID from '@/app/api/[[...slugs]]/_lib/ppid/dasar_hukum';
import { PESAN_ADMIN_DOKUMEN, PESAN_DOKUMEN_TIDAK_ADA } from '@/app/api/[[...slugs]]/_lib/ppid/dasar_hukum/dokumen/dokumen.guard';
import {
  JUDUL_DOKUMEN_MAX,
  PESAN_JUDUL_DOKUMEN,
} from '@/app/api/[[...slugs]]/_lib/ppid/dasar_hukum/dokumen/dokumen.rules';
import { PESAN_URUTAN_TIDAK_VALID } from '@/app/api/[[...slugs]]/_lib/ppid/dasar_hukum/dokumen/reorder';
import { PESAN_FILE_PPID_TIDAK_ADA, PPID_FILE_SELECT } from '@/app/api/[[...slugs]]/_lib/ppid/ppid-file';

const app = new Elysia({ prefix: '/api/ppid' }).use(DasarHukumPPID);
const BASE = 'http://localhost/api/ppid/dasarhukumppid/dokumen';
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
const ROW = { id: 'dok-1', judul: 'Perdes 1', urutan: 0, file: FILE };
const orderOf = (fn: ReturnType<typeof vi.fn>) => fn.mock.invocationCallOrder[0];

beforeEach(() => {
  vi.resetAllMocks();
  prismaMock.$transaction.mockImplementation(async (ops: Promise<unknown>[]) => Promise.all(ops));
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  asRole('2');
});

describe('GET /dokumen/find-many (publik)', () => {
  it('hanya dokumen aktif, urut urutan lalu createdAt, tanpa perlu sesi', async () => {
    dokumen.findMany.mockResolvedValue([ROW]);
    const res = await send('GET', '/find-many');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: [ROW] });
    expect(requireAuthMock).not.toHaveBeenCalled();
    const arg = dokumen.findMany.mock.calls[0][0];
    expect(arg.where).toEqual({ isActive: true, deletedAt: null });
    expect(arg.orderBy).toEqual([{ urutan: 'asc' }, { createdAt: 'asc' }]);
    expect(arg.select).toEqual({ id: true, judul: true, urutan: true, file: { select: PPID_FILE_SELECT } });
    expect(arg.take).toBeGreaterThan(0);
  });
});

describe('guard admin (semua mutasi)', () => {
  const mutasi: [string, string, string, unknown][] = [
    ['POST', '/create', 'create', { judul: 'A', fileId: FILE.id }],
    ['PUT', '/updt/dok-1', 'updt', { judul: 'B' }],
    ['PUT', '/reorder', 'reorder', { ids: ['dok-1'] }],
    ['DELETE', '/del/dok-1', 'del', undefined],
  ];

  it.each(mutasi)('%s %s tanpa sesi → 401, tanpa menyentuh DB', async (method, path, _nama, body) => {
    noSession(401);
    const res = await send(method, path, body);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ success: false, message: 'Unauthorized' });
    expect(dokumen.create).not.toHaveBeenCalled();
    expect(dokumen.update).not.toHaveBeenCalled();
    expect(dokumen.delete).not.toHaveBeenCalled();
    expect(removeStoredFile).not.toHaveBeenCalled();
  });

  it.each(mutasi)('%s %s akun role 5 (bukan admin) → 403, tanpa menyentuh DB', async (method, path, _nama, body) => {
    asRole('5');
    const res = await send(method, path, body);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ success: false, message: PESAN_ADMIN_DOKUMEN });
    expect(dokumen.create).not.toHaveBeenCalled();
    expect(dokumen.update).not.toHaveBeenCalled();
    expect(dokumen.delete).not.toHaveBeenCalled();
    expect(removeStoredFile).not.toHaveBeenCalled();
  });
});

describe('POST /dokumen/create', () => {
  it('menyimpan judul rapi + fileId, urutan = terakhir + 1', async () => {
    fileStorage.findUnique.mockResolvedValue({ id: FILE.id });
    dokumen.aggregate.mockResolvedValue({ _max: { urutan: 4 } });
    dokumen.create.mockResolvedValue({ ...ROW, urutan: 5 });
    const res = await send('POST', '/create', { judul: '  Perdes   Nomor 1  ', fileId: FILE.id });
    expect(res.status).toBe(200);
    expect(dokumen.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { judul: 'Perdes Nomor 1', fileId: FILE.id, urutan: 5 } }),
    );
    expect((await res.json()).data.urutan).toBe(5);
  });

  it('dokumen pertama mendapat urutan 0', async () => {
    fileStorage.findUnique.mockResolvedValue({ id: FILE.id });
    dokumen.aggregate.mockResolvedValue({ _max: { urutan: null } });
    dokumen.create.mockResolvedValue(ROW);
    await send('POST', '/create', { judul: 'Perdes 1', fileId: FILE.id });
    expect(dokumen.create.mock.calls[0][0].data.urutan).toBe(0);
  });

  it.each([
    ['judul kosong/spasi', { judul: '   ', fileId: FILE.id }, PESAN_JUDUL_DOKUMEN.kosong],
    ['judul > 200 karakter', { judul: 'x'.repeat(JUDUL_DOKUMEN_MAX + 1), fileId: FILE.id }, PESAN_JUDUL_DOKUMEN.terlaluPanjang],
    ['judul memuat tag', { judul: '<b>SK</b>', fileId: FILE.id }, PESAN_JUDUL_DOKUMEN.bukanTeksPolos],
  ])('menolak %s (400), tidak menulis apa pun', async (_nama, body, message) => {
    const res = await send('POST', '/create', body);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message });
    expect(dokumen.create).not.toHaveBeenCalled();
  });

  it('judul tepat 200 karakter diterima', async () => {
    fileStorage.findUnique.mockResolvedValue({ id: FILE.id });
    dokumen.aggregate.mockResolvedValue({ _max: { urutan: 0 } });
    dokumen.create.mockResolvedValue(ROW);
    const res = await send('POST', '/create', { judul: 'x'.repeat(JUDUL_DOKUMEN_MAX), fileId: FILE.id });
    expect(res.status).toBe(200);
  });

  it('menolak fileId yang tidak ada di FileStorage (400)', async () => {
    fileStorage.findUnique.mockResolvedValue(null);
    const res = await send('POST', '/create', { judul: 'Perdes 1', fileId: 'tidak-ada' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_FILE_PPID_TIDAK_ADA });
    expect(dokumen.create).not.toHaveBeenCalled();
  });

  it('menolak fileId kosong (400) dan body tanpa fileId (422 kontrak body)', async () => {
    expect((await send('POST', '/create', { judul: 'Perdes 1', fileId: '' })).status).toBe(400);
    expect((await send('POST', '/create', { judul: 'Perdes 1' })).status).toBe(422);
    expect(dokumen.create).not.toHaveBeenCalled();
  });
});

describe('PUT /dokumen/updt/:id', () => {
  it('mengubah judul saja', async () => {
    dokumen.findFirst.mockResolvedValue({ id: 'dok-1' });
    dokumen.update.mockResolvedValue({ ...ROW, judul: 'Judul Baru' });
    const res = await send('PUT', '/updt/dok-1', { judul: ' Judul  Baru ' });
    expect(res.status).toBe(200);
    expect(dokumen.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'dok-1' }, data: { judul: 'Judul Baru' } }),
    );
  });

  it('judul tidak valid → 400; id tidak ada → 404', async () => {
    const bad = await send('PUT', '/updt/dok-1', { judul: '' });
    expect(bad.status).toBe(400);
    dokumen.findFirst.mockResolvedValue(null);
    const missing = await send('PUT', '/updt/x', { judul: 'Baru' });
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ success: false, message: PESAN_DOKUMEN_TIDAK_ADA });
    expect(dokumen.update).not.toHaveBeenCalled();
  });
});

describe('PUT /dokumen/reorder', () => {
  it('menulis urutan 0..n-1 sesuai daftar id dalam satu transaksi', async () => {
    dokumen.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    dokumen.update.mockImplementation((arg: { where: { id: string } }) => Promise.resolve(arg));
    const res = await send('PUT', '/reorder', { ids: ['c', 'a', 'b'] });
    expect(res.status).toBe(200);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.$transaction.mock.calls[0][0]).toHaveLength(3);
    expect(dokumen.update.mock.calls.map(([arg]) => [arg.where.id, arg.data.urutan])).toEqual([
      ['c', 0],
      ['a', 1],
      ['b', 2],
    ]);
  });

  it('id tidak dikenal → 400, tidak ada transaksi', async () => {
    dokumen.findMany.mockResolvedValue([{ id: 'a' }]);
    const res = await send('PUT', '/reorder', { ids: ['a', 'asing'] });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_URUTAN_TIDAK_VALID });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(dokumen.update).not.toHaveBeenCalled();
  });

  it('id berulang → 400; daftar kosong ditolak kontrak body (422)', async () => {
    dokumen.findMany.mockResolvedValue([{ id: 'a' }]);
    expect((await send('PUT', '/reorder', { ids: ['a', 'a'] })).status).toBe(400);
    expect((await send('PUT', '/reorder', { ids: [] })).status).toBe(422);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});

describe('DELETE /dokumen/del/:id', () => {
  it('menghapus baris DULU, baru berkas FileStorage-nya', async () => {
    dokumen.findUnique.mockResolvedValue({ id: 'dok-1', fileId: FILE.id });
    const res = await send('DELETE', '/del/dok-1');
    expect(res.status).toBe(200);
    expect(dokumen.delete).toHaveBeenCalledWith({ where: { id: 'dok-1' } });
    expect(removeStoredFile).toHaveBeenCalledWith({ id: FILE.id }, 'DokumenDasarHukumPPID');
    expect(orderOf(removeStoredFile)).toBeGreaterThan(orderOf(dokumen.delete));
  });

  it('id tidak ada → 404, berkas tidak disentuh', async () => {
    dokumen.findUnique.mockResolvedValue(null);
    const res = await send('DELETE', '/del/x');
    expect(res.status).toBe(404);
    expect(dokumen.delete).not.toHaveBeenCalled();
    expect(removeStoredFile).not.toHaveBeenCalled();
  });
});
