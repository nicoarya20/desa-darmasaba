// @vitest-environment node
// API tempat sampah & salin dokumen Desa Anti Korupsi (khusus admin): guard 401/403, validasi 400,
// 404/409, purge lazy sebelum daftar dibaca, transaksi salin; plus regresi soft delete sinkron (deletedAt).
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthMock, prismaMock, tx, minioMock } = vi.hoisted(() => {
  const dokumen = {
    deleteMany: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    createMany: vi.fn(),
  };
  const folder = { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() };
  const program = { findUnique: vi.fn() };
  const tx = { dokumenDesaAntiKorupsi: dokumen, folderDokumenDesaAntiKorupsi: folder, desaAntiKorupsi: program };
  return {
    requireAuthMock: vi.fn(),
    tx,
    prismaMock: {
      ...tx,
      $transaction: vi.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
      fileStorage: { findUnique: vi.fn(), delete: vi.fn() },
      $queryRaw: vi.fn(),
      $queryRawUnsafe: vi.fn(),
    },
    minioMock: { removeObject: vi.fn() },
  };
});
vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/lib/minio', () => ({ default: minioMock, MINIO_BUCKET: 'bucket-test' }));

import {
  desaAntiKorupsiSampahHapus,
  desaAntiKorupsiSampahList,
  desaAntiKorupsiSampahPulihkan,
} from '@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/sampah';
import salinKeProgram from '@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/salin';
import { applyProgramSync } from '@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/dokumen-sync';
import { resetFileForeignKeysCache } from '@/app/api/[[...slugs]]/_lib/fileStorage/_lib/fileReferences';

const HARI = 24 * 60 * 60 * 1000;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context Elysia tiruan minimal
const ctx = (params: Record<string, string>, body?: unknown): any => ({ params, body, set: {} });
const asRole = (roleId: string) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: `u-${roleId}`, roleId, isActive: true } });
const noSession = (status = 401) =>
  requireAuthMock.mockResolvedValue({
    authenticated: false,
    response: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status }),
  });
const file = { id: 'f1', link: '/l/f1', realName: 'a.pdf', mimeType: 'application/pdf' };
const salinBody = { dokumenIds: ['d1', 'd2'], targetProgramId: 'p2', targetFolderId: 'fo2' };

type Handler = (c: ReturnType<typeof ctx>) => Promise<unknown>;
const endpoints: [string, Handler, () => ReturnType<typeof ctx>][] = [
  ['GET /:id/sampah', desaAntiKorupsiSampahList, () => ctx({ id: 'p1' })],
  ['POST /sampah/:id/pulihkan', desaAntiKorupsiSampahPulihkan, () => ctx({ dokumenId: 'd1' })],
  ['DELETE /sampah/:id', desaAntiKorupsiSampahHapus, () => ctx({ dokumenId: 'd1' })],
  ['POST /dokumen/salin-ke-program', salinKeProgram, () => ctx({}, salinBody)],
];

beforeEach(() => {
  vi.clearAllMocks();
  asRole('2');
});

describe('guard admin (semua endpoint sampah & salin)', () => {
  it.each(endpoints)('%s tanpa sesi → 401, DB tidak disentuh', async (_n, handler, make) => {
    noSession();
    const c = make();
    expect(await handler(c)).toEqual({ success: false, message: 'Unauthorized' });
    expect(c.set.status).toBe(401);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(tx.dokumenDesaAntiKorupsi.deleteMany).not.toHaveBeenCalled();
    expect(tx.desaAntiKorupsi.findUnique).not.toHaveBeenCalled();
  });

  it.each(endpoints)('%s role user (5) → 403, DB tidak disentuh', async (_n, handler, make) => {
    asRole('5');
    const c = make();
    expect(await handler(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(403);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(tx.dokumenDesaAntiKorupsi.deleteMany).not.toHaveBeenCalled();
  });

  it('akun nonaktif (403 dari requireAuth) diteruskan', async () => {
    noSession(403);
    const c = ctx({ id: 'p1' });
    await desaAntiKorupsiSampahList(c);
    expect(c.set.status).toBe(403);
  });
});

describe('GET /:id/sampah', () => {
  it('program tidak ada → 404 tanpa purge', async () => {
    tx.desaAntiKorupsi.findUnique.mockResolvedValueOnce(null);
    const c = ctx({ id: 'p1' });
    expect(await desaAntiKorupsiSampahList(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(404);
    expect(tx.dokumenDesaAntiKorupsi.deleteMany).not.toHaveBeenCalled();
  });

  it('purge kedaluwarsa dulu, baru daftar terbaru dulu dengan folderNama & sisaHari', async () => {
    const now = Date.now();
    tx.desaAntiKorupsi.findUnique.mockResolvedValueOnce({ id: 'p1' });
    tx.dokumenDesaAntiKorupsi.findMany.mockResolvedValueOnce([]); // tidak ada yang kedaluwarsa
    const deletedAt = new Date(now - 3 * HARI);
    tx.dokumenDesaAntiKorupsi.findMany.mockResolvedValueOnce([
      { id: 'd1', judul: 'A', folderId: 'fo1', folder: { nama: 'Laporan' }, file, deletedAt },
    ]);

    const res = await desaAntiKorupsiSampahList(ctx({ id: 'p1' }));

    const [purge, list] = tx.dokumenDesaAntiKorupsi.findMany.mock.calls.map((c) => c[0]);
    expect(purge).toMatchObject({ where: { desaAntiKorupsiId: 'p1', isActive: false }, select: { id: true } });
    expect(Math.abs(purge.where.deletedAt.lte.getTime() - (now - 30 * HARI))).toBeLessThan(5000);
    expect(tx.dokumenDesaAntiKorupsi.deleteMany).not.toHaveBeenCalled();
    expect(list).toMatchObject({
      where: { desaAntiKorupsiId: 'p1', isActive: false, deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
    });
    expect(res).toEqual({
      success: true,
      data: [{ id: 'd1', judul: 'A', folderId: 'fo1', folderNama: 'Laporan', file, deletedAt, sisaHari: 27 }],
    });
  });
});

describe('GET /:id/sampah — pembersihan lazy lewat jalur hapus permanen Sampah', () => {
  const trashedFile = { id: 'f1', path: 'dak', name: 'a.pdf', mimeType: 'application/pdf', category: 'document', size: 1 };

  beforeEach(() => {
    resetFileForeignKeysCache();
    tx.desaAntiKorupsi.findUnique.mockResolvedValue({ id: 'p1' });
    prismaMock.$queryRaw.mockResolvedValue([{ tabel: 'public."DokumenDesaAntiKorupsi"', kolom: '"fileId"' }]);
    prismaMock.$queryRawUnsafe.mockResolvedValue([{ dirujuk: false }]);
    prismaMock.fileStorage.findUnique.mockResolvedValue({ path: 'dak', name: 'a.pdf' });
    tx.dokumenDesaAntiKorupsi.findFirst.mockResolvedValue({ file: trashedFile });
    tx.dokumenDesaAntiKorupsi.deleteMany.mockResolvedValue({ count: 1 });
  });

  it('dokumen kedaluwarsa dihapus berurutan baris → FileStorage → MinIO, lalu daftar dibaca', async () => {
    tx.dokumenDesaAntiKorupsi.findMany.mockResolvedValueOnce([{ id: 'd1' }]).mockResolvedValueOnce([]);

    expect(await desaAntiKorupsiSampahList(ctx({ id: 'p1' }))).toEqual({ success: true, data: [] });

    expect(tx.dokumenDesaAntiKorupsi.deleteMany).toHaveBeenCalledWith({
      where: { id: 'd1', isActive: false, deletedAt: { not: null } },
    });
    expect(prismaMock.fileStorage.delete).toHaveBeenCalledWith({ where: { id: 'f1' } });
    expect(minioMock.removeObject).toHaveBeenCalledWith('bucket-test', 'dak/a.pdf');
    const order = (fn: { mock: { invocationCallOrder: number[] } }) => fn.mock.invocationCallOrder[0];
    expect(order(tx.dokumenDesaAntiKorupsi.deleteMany)).toBeLessThan(order(prismaMock.fileStorage.delete));
    expect(order(prismaMock.fileStorage.delete)).toBeLessThan(order(minioMock.removeObject));
    expect(tx.dokumenDesaAntiKorupsi.findMany.mock.calls[1][0].where).toMatchObject({ deletedAt: { not: null } });
  });

  it('berkas masih dipakai dokumen lain → baris dihapus, berkas & MinIO dibiarkan', async () => {
    prismaMock.$queryRawUnsafe.mockResolvedValue([{ dirujuk: true }]);
    tx.dokumenDesaAntiKorupsi.findMany.mockResolvedValueOnce([{ id: 'd1' }]).mockResolvedValueOnce([]);

    await desaAntiKorupsiSampahList(ctx({ id: 'p1' }));

    expect(tx.dokumenDesaAntiKorupsi.deleteMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
    expect(minioMock.removeObject).not.toHaveBeenCalled();
  });

  it('dipaging per 100 ID dengan cursor; gagal satu dokumen tidak menghentikan yang lain', async () => {
    const batch = Array.from({ length: 100 }, (_, i) => ({ id: `d${String(i).padStart(3, '0')}` }));
    tx.dokumenDesaAntiKorupsi.findMany
      .mockResolvedValueOnce(batch)
      .mockResolvedValueOnce([{ id: 'd100' }])
      .mockResolvedValueOnce([]);
    tx.dokumenDesaAntiKorupsi.findFirst.mockRejectedValueOnce(new Error('db putus'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(await desaAntiKorupsiSampahList(ctx({ id: 'p1' }))).toEqual({ success: true, data: [] });

    const calls = tx.dokumenDesaAntiKorupsi.findMany.mock.calls.map((c) => c[0]);
    expect(calls[0]).toMatchObject({ orderBy: { id: 'asc' }, take: 100 });
    expect(calls[1].where.id).toEqual({ gt: 'd099' });
    expect(tx.dokumenDesaAntiKorupsi.deleteMany).toHaveBeenCalledTimes(100);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('dak:d000'), expect.any(Error));
    errorSpy.mockRestore();
  });
});

describe('POST /sampah/:dokumenId/pulihkan', () => {
  const inTrash = (over: Record<string, unknown> = {}) => ({
    id: 'd1',
    desaAntiKorupsiId: 'p1',
    fileId: 'f1',
    folderId: 'fo1',
    folder: { isActive: true },
    file: { isActive: true },
    ...over,
  });

  it('tidak ada di sampah (atau sudah lewat retensi) → 404', async () => {
    tx.dokumenDesaAntiKorupsi.findFirst.mockResolvedValueOnce(null);
    const c = ctx({ dokumenId: 'd1' });
    expect(await desaAntiKorupsiSampahPulihkan(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(404);
    expect(tx.dokumenDesaAntiKorupsi.findFirst.mock.calls[0][0].where).toMatchObject({ id: 'd1', isActive: false });
    expect(tx.dokumenDesaAntiKorupsi.findFirst.mock.calls[0][0].where.deletedAt.gt).toBeInstanceOf(Date);
  });

  it('folder asal aktif → kembali ke folder asal di akhir, deletedAt dikosongkan', async () => {
    tx.dokumenDesaAntiKorupsi.findFirst.mockResolvedValueOnce(inTrash());
    tx.dokumenDesaAntiKorupsi.findMany.mockResolvedValueOnce([{ folderId: 'fo1', fileId: 'f2', urutan: 2 }]);
    const res = await desaAntiKorupsiSampahPulihkan(ctx({ dokumenId: 'd1' }));
    expect(res).toEqual({ success: true, data: { id: 'd1', folderId: 'fo1' } });
    expect(tx.dokumenDesaAntiKorupsi.update).toHaveBeenCalledWith({
      where: { id: 'd1' },
      data: { isActive: true, deletedAt: null, folderId: 'fo1', urutan: 3 },
    });
  });

  it('folder asal terhapus → ke Umum', async () => {
    tx.dokumenDesaAntiKorupsi.findFirst.mockResolvedValueOnce(inTrash({ folder: { isActive: false } }));
    tx.dokumenDesaAntiKorupsi.findMany.mockResolvedValueOnce([]);
    expect(await desaAntiKorupsiSampahPulihkan(ctx({ dokumenId: 'd1' }))).toEqual({
      success: true,
      data: { id: 'd1', folderId: null },
    });
  });

  it('tujuan sudah berisi berkas sama → 409, tidak di-update', async () => {
    tx.dokumenDesaAntiKorupsi.findFirst.mockResolvedValueOnce(inTrash());
    tx.dokumenDesaAntiKorupsi.findMany.mockResolvedValueOnce([{ folderId: 'fo1', fileId: 'f1', urutan: 0 }]);
    const c = ctx({ dokumenId: 'd1' });
    expect(await desaAntiKorupsiSampahPulihkan(c)).toMatchObject({ success: false, message: expect.any(String) });
    expect(c.set.status).toBe(409);
    expect(tx.dokumenDesaAntiKorupsi.update).not.toHaveBeenCalled();
  });
});

describe('DELETE /sampah/:dokumenId — jalur hapus permanen Sampah bersama', () => {
  beforeEach(() => {
    resetFileForeignKeysCache();
    prismaMock.$queryRaw.mockResolvedValue([{ tabel: 'public."DokumenDesaAntiKorupsi"', kolom: '"fileId"' }]);
    prismaMock.$queryRawUnsafe.mockResolvedValue([{ dirujuk: false }]);
    prismaMock.fileStorage.findUnique.mockResolvedValue({ path: 'dak', name: 'a.pdf' });
    tx.dokumenDesaAntiKorupsi.findFirst.mockResolvedValue({ file: { id: 'f1' } });
    tx.dokumenDesaAntiKorupsi.deleteMany.mockResolvedValue({ count: 1 });
  });

  it('baris di sampah → baris, FileStorage, lalu MinIO dihapus berurutan → 200 (respons tetap)', async () => {
    expect(await desaAntiKorupsiSampahHapus(ctx({ dokumenId: 'd1' }))).toEqual({ success: true, data: { id: 'd1' } });
    expect(tx.dokumenDesaAntiKorupsi.findFirst.mock.calls[0][0].where).toEqual({
      id: 'd1',
      isActive: false,
      deletedAt: { not: null },
    });
    expect(tx.dokumenDesaAntiKorupsi.deleteMany).toHaveBeenCalledWith({
      where: { id: 'd1', isActive: false, deletedAt: { not: null } },
    });
    expect(prismaMock.fileStorage.delete).toHaveBeenCalledWith({ where: { id: 'f1' } });
    expect(minioMock.removeObject).toHaveBeenCalledWith('bucket-test', 'dak/a.pdf');
    const order = (fn: { mock: { invocationCallOrder: number[] } }) => fn.mock.invocationCallOrder[0];
    expect(order(tx.dokumenDesaAntiKorupsi.deleteMany)).toBeLessThan(order(prismaMock.fileStorage.delete));
    expect(order(prismaMock.fileStorage.delete)).toBeLessThan(order(minioMock.removeObject));
  });

  it('berkas masih dipakai dokumen lain → hanya baris dihapus, FileStorage & MinIO dibiarkan', async () => {
    prismaMock.$queryRawUnsafe.mockResolvedValue([{ dirujuk: true }]);
    expect(await desaAntiKorupsiSampahHapus(ctx({ dokumenId: 'd1' }))).toEqual({ success: true, data: { id: 'd1' } });
    expect(tx.dokumenDesaAntiKorupsi.deleteMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
    expect(minioMock.removeObject).not.toHaveBeenCalled();
  });

  it('tidak ada / masih aktif → 404 tanpa menghapus apa pun', async () => {
    tx.dokumenDesaAntiKorupsi.findFirst.mockResolvedValueOnce(null);
    const c = ctx({ dokumenId: 'd1' });
    expect(await desaAntiKorupsiSampahHapus(c)).toEqual({ success: false, message: 'Dokumen tidak ada di tempat sampah' });
    expect(c.set.status).toBe(404);
    expect(tx.dokumenDesaAntiKorupsi.deleteMany).not.toHaveBeenCalled();
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
  });

  it('baris sudah terhapus bersamaan (deleteMany 0) → 404, berkas tidak disentuh', async () => {
    tx.dokumenDesaAntiKorupsi.deleteMany.mockResolvedValueOnce({ count: 0 });
    const c = ctx({ dokumenId: 'd1' });
    expect(await desaAntiKorupsiSampahHapus(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(404);
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
    expect(minioMock.removeObject).not.toHaveBeenCalled();
  });
});

describe('POST /dokumen/salin-ke-program', () => {
  it('body tidak valid → 400 tanpa transaksi', async () => {
    const c = ctx({}, { ...salinBody, dokumenIds: [] });
    expect(await salinKeProgram(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('program tujuan tidak ada → 400', async () => {
    tx.desaAntiKorupsi.findUnique.mockResolvedValueOnce(null);
    const c = ctx({}, salinBody);
    expect(await salinKeProgram(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(400);
  });

  it('folder tujuan bukan milik program tujuan / nonaktif → 400', async () => {
    tx.desaAntiKorupsi.findUnique.mockResolvedValueOnce({ id: 'p2' });
    tx.folderDokumenDesaAntiKorupsi.findFirst.mockResolvedValueOnce(null);
    const c = ctx({}, salinBody);
    expect(await salinKeProgram(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(400);
    expect(tx.folderDokumenDesaAntiKorupsi.findFirst).toHaveBeenCalledWith({
      where: { id: 'fo2', desaAntiKorupsiId: 'p2', isActive: true },
      select: { id: true },
    });
    expect(tx.dokumenDesaAntiKorupsi.createMany).not.toHaveBeenCalled();
  });

  it('salin di dalam transaksi: berkas yang sudah ada dilewati, sisanya di akhir folder tujuan', async () => {
    tx.desaAntiKorupsi.findUnique.mockResolvedValueOnce({ id: 'p2' });
    tx.folderDokumenDesaAntiKorupsi.findFirst.mockResolvedValueOnce({ id: 'fo2' });
    tx.dokumenDesaAntiKorupsi.findMany
      .mockResolvedValueOnce([
        { id: 'd1', desaAntiKorupsiId: 'p1', fileId: 'f1', judul: 'Satu' },
        { id: 'd2', desaAntiKorupsiId: 'p1', fileId: 'f2', judul: 'Dua' },
      ])
      .mockResolvedValueOnce([{ folderId: 'fo2', fileId: 'f2', urutan: 4 }]);

    const res = await salinKeProgram(ctx({}, salinBody));

    expect(res).toEqual({ success: true, data: { copied: 1, skipped: 1 } });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.dokumenDesaAntiKorupsi.findMany.mock.calls[0][0].where).toEqual({ id: { in: ['d1', 'd2'] }, isActive: true });
    expect(tx.dokumenDesaAntiKorupsi.createMany).toHaveBeenCalledWith({
      data: [{ fileId: 'f1', judul: 'Satu', urutan: 5, desaAntiKorupsiId: 'p2', folderId: 'fo2' }],
    });
  });

  it('program tujuan akan melebihi batas → 409, tidak ada yang dibuat', async () => {
    tx.desaAntiKorupsi.findUnique.mockResolvedValueOnce({ id: 'p2' });
    tx.dokumenDesaAntiKorupsi.findMany
      .mockResolvedValueOnce([{ id: 'd1', desaAntiKorupsiId: 'p1', fileId: 'f1', judul: 'Satu' }])
      .mockResolvedValueOnce(Array.from({ length: 50 }, (_, i) => ({ folderId: null, fileId: `x${i}`, urutan: i })));
    const c = ctx({}, { dokumenIds: ['d1'], targetProgramId: 'p2', targetFolderId: null });
    expect(await salinKeProgram(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(409);
    expect(tx.folderDokumenDesaAntiKorupsi.findFirst).not.toHaveBeenCalled();
    expect(tx.dokumenDesaAntiKorupsi.createMany).not.toHaveBeenCalled();
  });
});

describe('regresi sinkron dokumen (sumber isi tempat sampah)', () => {
  it('dokumen yang dihapus di-soft-delete dengan deletedAt terisi', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tx tiruan minimal
    await applyProgramSync(tx as any, 'p1', { folders: null, dokumen: { create: [], update: [], remove: ['d1', 'd2'] } });
    const arg = tx.dokumenDesaAntiKorupsi.updateMany.mock.calls[0][0];
    expect(arg.where).toEqual({ desaAntiKorupsiId: 'p1', id: { in: ['d1', 'd2'] } });
    expect(arg.data.isActive).toBe(false);
    expect(arg.data.deletedAt).toBeInstanceOf(Date);
  });

  it('folder dihapus: dokumennya dipindah ke Umum lalu folder di-soft-delete dengan deletedAt', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tx tiruan minimal
    await applyProgramSync(tx as any, 'p1', { folders: { create: [], update: [], remove: ['fo1'] }, dokumen: null });
    expect(tx.dokumenDesaAntiKorupsi.updateMany).toHaveBeenCalledWith({
      where: { desaAntiKorupsiId: 'p1', folderId: { in: ['fo1'] } },
      data: { folderId: null },
    });
    const folderArg = tx.folderDokumenDesaAntiKorupsi.updateMany.mock.calls[0][0];
    expect(folderArg.data.isActive).toBe(false);
    expect(folderArg.data.deletedAt).toBeInstanceOf(Date);
  });
});
