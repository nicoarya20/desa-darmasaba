// @vitest-environment node
// API Desa Anti Korupsi: create/update menyinkronkan folder + dokumen dalam satu transaksi;
// findMany hanya ringkasan jumlah, findUnique mengelompokkan dokumen per folder.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DESA_ANTI_KORUPSI_DETAIL_INCLUDE,
  DESA_ANTI_KORUPSI_RINGKAS_INCLUDE,
} from '@/lib/desa-anti-korupsi-view';

const prismaMock = vi.hoisted(() => {
  const dokumen = { findMany: vi.fn(), updateMany: vi.fn(), update: vi.fn(), createMany: vi.fn() };
  const folder = { findMany: vi.fn(), updateMany: vi.fn(), update: vi.fn(), create: vi.fn() };
  const program = {
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    count: vi.fn(),
  };
  const fileStorage = { count: vi.fn() };
  const tx = { dokumenDesaAntiKorupsi: dokumen, folderDokumenDesaAntiKorupsi: folder, desaAntiKorupsi: program };
  return {
    ...tx,
    fileStorage,
    $transaction: vi.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
  };
});
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import dakCreate from '@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/create';
import dakUpdate from '@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/updt';
import dakFindMany from '@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/findMany';
import dakFindUnique from '@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/findUnique';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context Elysia tiruan minimal
const ctx = (body: unknown, id?: string, query: Record<string, string> = {}): any => ({
  body,
  query,
  params: id ? { id } : {},
  set: { status: 200 },
});

const base = { name: 'Program A', deskripsi: 'x', kategoriId: 'k1' };
const detailRow = (over: Record<string, unknown> = {}) => ({ id: 'p1', ...base, folders: [], dokumen: [], ...over });
const file = (id: string) => ({ id, link: `/l/${id}`, realName: `${id}.pdf`, mimeType: 'application/pdf' });
const calls = (fn: { mock: { calls: unknown[][] } }) => fn.mock.calls.map((c) => c[0]);

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.folderDokumenDesaAntiKorupsi.findMany.mockResolvedValue([]);
  prismaMock.dokumenDesaAntiKorupsi.findMany.mockResolvedValue([]);
});

describe('create', () => {
  it('membuat program, folder baru (tempKey), lalu dokumen yang dirujuk ke id folder baru', async () => {
    prismaMock.fileStorage.count.mockResolvedValueOnce(2);
    prismaMock.desaAntiKorupsi.create.mockResolvedValueOnce({ id: 'p1' });
    prismaMock.folderDokumenDesaAntiKorupsi.create.mockResolvedValueOnce({ id: 'folder-db-1' });
    prismaMock.desaAntiKorupsi.findUniqueOrThrow.mockResolvedValueOnce(detailRow());

    const res = await dakCreate(
      ctx({
        ...base,
        folders: [{ tempKey: 't1', nama: 'Laporan', urutan: 0 }],
        dokumen: [
          { fileId: 'f1', judul: 'Satu', urutan: 0, folder: { tempKey: 't1' } },
          { fileId: 'f2', judul: 'Dua', urutan: 0, folder: null },
        ],
      }),
    );

    expect(res).toMatchObject({ success: true, data: { id: 'p1', folders: [], dokumenUmum: [] } });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.desaAntiKorupsi.create).toHaveBeenCalledWith({ data: base, select: { id: true } });
    expect(prismaMock.folderDokumenDesaAntiKorupsi.create).toHaveBeenCalledWith({
      data: { desaAntiKorupsiId: 'p1', nama: 'Laporan', urutan: 0 },
      select: { id: true },
    });
    expect(prismaMock.dokumenDesaAntiKorupsi.createMany).toHaveBeenCalledWith({
      data: [
        { desaAntiKorupsiId: 'p1', fileId: 'f1', judul: 'Satu', urutan: 0, folderId: 'folder-db-1' },
        { desaAntiKorupsiId: 'p1', fileId: 'f2', judul: 'Dua', urutan: 0, folderId: null },
      ],
    });
    expect(prismaMock.desaAntiKorupsi.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 'p1' },
      include: DESA_ANTI_KORUPSI_DETAIL_INCLUDE,
    });
    // program baru: tidak perlu membaca isi tersimpan
    expect(prismaMock.dokumenDesaAntiKorupsi.findMany).not.toHaveBeenCalled();
  });

  it('tanpa folder & dokumen → program kosong, tidak cek FileStorage', async () => {
    prismaMock.desaAntiKorupsi.create.mockResolvedValueOnce({ id: 'p1' });
    prismaMock.desaAntiKorupsi.findUniqueOrThrow.mockResolvedValueOnce(detailRow());
    await dakCreate(ctx(base));
    expect(prismaMock.fileStorage.count).not.toHaveBeenCalled();
    expect(prismaMock.dokumenDesaAntiKorupsi.createMany).not.toHaveBeenCalled();
    expect(prismaMock.folderDokumenDesaAntiKorupsi.create).not.toHaveBeenCalled();
  });

  it.each([
    ['judul dokumen kosong', { dokumen: [{ fileId: 'f1', judul: '', urutan: 0 }] }, 'Dokumen #1: judul wajib diisi'],
    ['dokumen ber-id', { dokumen: [{ id: 'd1', fileId: 'f1', judul: 'A', urutan: 0 }] }, 'Dokumen tidak ditemukan pada program ini'],
    ['folder ber-id', { folders: [{ id: 'fa', nama: 'A', urutan: 0 }] }, 'Folder tidak ditemukan pada program ini'],
    ['tempKey tak dikenal', { folders: [], dokumen: [{ fileId: 'f1', judul: 'A', urutan: 0, folder: { tempKey: 'x' } }] }, 'Dokumen #1: folder baru tidak ada di daftar folder'],
  ])('payload tidak valid (%s) → 400, tidak menyentuh DB', async (_label, extra, message) => {
    const c = ctx({ ...base, ...extra });
    const res = await dakCreate(c);
    expect(c.set.status).toBe(400);
    expect(res).toEqual({ success: false, message });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('fileId tidak ada / nonaktif di FileStorage → 400', async () => {
    prismaMock.fileStorage.count.mockResolvedValueOnce(0);
    const c = ctx({ ...base, dokumen: [{ fileId: 'hilang', judul: 'A', urutan: 0 }] });
    const res = await dakCreate(c);
    expect(c.set.status).toBe(400);
    expect(res).toEqual({ success: false, message: 'File dokumen tidak ditemukan atau sudah dihapus' });
  });
});

describe('update', () => {
  it('tanpa folders & dokumen → isi tidak disentuh (tanpa transaksi), respons berbentuk detail', async () => {
    prismaMock.desaAntiKorupsi.update.mockResolvedValueOnce(detailRow());
    const res = await dakUpdate(ctx(base, 'p1'));
    expect(res).toMatchObject({ success: true, data: { folders: [], dokumenUmum: [] } });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.dokumenDesaAntiKorupsi.findMany).not.toHaveBeenCalled();
    expect(prismaMock.desaAntiKorupsi.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: base,
      include: DESA_ANTI_KORUPSI_DETAIL_INCLUDE,
    });
  });

  it('rename + hapus folder (dokumen ke Umum) + pindah dokumen + dokumen baru dalam satu transaksi', async () => {
    prismaMock.folderDokumenDesaAntiKorupsi.findMany.mockResolvedValueOnce([
      { id: 'fa', nama: 'Laporan', urutan: 0 },
      { id: 'fb', nama: 'SK', urutan: 1 },
    ]);
    prismaMock.dokumenDesaAntiKorupsi.findMany.mockResolvedValueOnce([
      { id: 'a', fileId: 'xa', judul: 'A', urutan: 0, folderId: 'fa' },
      { id: 'b', fileId: 'xb', judul: 'B', urutan: 0, folderId: 'fb' },
      { id: 'c', fileId: 'xc', judul: 'C', urutan: 1, folderId: 'fb' },
    ]);
    prismaMock.fileStorage.count.mockResolvedValueOnce(1);
    prismaMock.folderDokumenDesaAntiKorupsi.create.mockResolvedValueOnce({ id: 'fbaru' });
    prismaMock.desaAntiKorupsi.findUniqueOrThrow.mockResolvedValueOnce(
      detailRow({
        folders: [{ id: 'fa', nama: 'Laporan 2025', urutan: 0 }],
        dokumen: [
          { id: 'a', judul: 'A', urutan: 0, fileId: 'xa', folderId: 'fa', file: file('xa') },
          { id: 'b', judul: 'B', urutan: 0, fileId: 'xb', folderId: null, file: file('xb') },
        ],
      }),
    );

    const res = await dakUpdate(
      ctx(
        {
          ...base,
          folders: [
            { id: 'fa', nama: 'Laporan 2025', urutan: 0 },
            { tempKey: 'n1', nama: 'Arsip', urutan: 1 },
          ],
          dokumen: [
            { id: 'a', fileId: 'xa', judul: 'A', urutan: 0, folder: { id: 'fa' } },
            { id: 'b', fileId: 'xb', judul: 'B', urutan: 0, folder: null }, // folder fb dihapus → Umum
            { fileId: 'xn', judul: 'Baru', urutan: 0, folder: { tempKey: 'n1' } },
          ],
        },
        'p1',
      ),
    );

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.desaAntiKorupsi.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: base });
    expect(calls(prismaMock.folderDokumenDesaAntiKorupsi.update)).toEqual([
      { where: { id: 'fa' }, data: { nama: 'Laporan 2025', urutan: 0 } },
    ]);
    const [lepasDokumen, hapusDokumenC] = calls(prismaMock.dokumenDesaAntiKorupsi.updateMany) as {
      where: unknown;
      data: Record<string, unknown>;
    }[];
    expect(lepasDokumen).toEqual({ where: { desaAntiKorupsiId: 'p1', folderId: { in: ['fb'] } }, data: { folderId: null } });
    expect(hapusDokumenC.where).toEqual({ desaAntiKorupsiId: 'p1', id: { in: ['c'] } });
    expect(hapusDokumenC.data.isActive).toBe(false);
    const hapusFolder = calls(prismaMock.folderDokumenDesaAntiKorupsi.updateMany)[0] as { where: unknown; data: Record<string, unknown> };
    expect(hapusFolder.where).toEqual({ desaAntiKorupsiId: 'p1', id: { in: ['fb'] } });
    expect(hapusFolder.data).toMatchObject({ isActive: false });
    expect(hapusFolder.data.deletedAt).toBeInstanceOf(Date);
    expect(calls(prismaMock.dokumenDesaAntiKorupsi.update)).toEqual([
      { where: { id: 'b' }, data: { judul: 'B', urutan: 0, folderId: null } },
    ]);
    expect(prismaMock.dokumenDesaAntiKorupsi.createMany).toHaveBeenCalledWith({
      data: [{ desaAntiKorupsiId: 'p1', fileId: 'xn', judul: 'Baru', urutan: 0, folderId: 'fbaru' }],
    });
    expect(res).toMatchObject({
      success: true,
      data: {
        folders: [{ id: 'fa', nama: 'Laporan 2025', dokumen: [{ id: 'a' }] }],
        dokumenUmum: [{ id: 'b' }],
      },
    });
  });

  it('dokumen merujuk folder milik program lain → 400 tanpa transaksi', async () => {
    prismaMock.folderDokumenDesaAntiKorupsi.findMany.mockResolvedValueOnce([{ id: 'fa', nama: 'A', urutan: 0 }]);
    const c = ctx({ ...base, dokumen: [{ fileId: 'fx', judul: 'X', urutan: 0, folder: { id: 'asing' } }] }, 'p1');
    const res = await dakUpdate(c);
    expect(c.set.status).toBe(400);
    expect(res).toEqual({ success: false, message: 'Dokumen #1: folder tidak ditemukan pada program ini' });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('isi tersimpan dibaca per program (aktif saja)', async () => {
    prismaMock.desaAntiKorupsi.findUniqueOrThrow.mockResolvedValueOnce(detailRow());
    await dakUpdate(ctx({ ...base, folders: [] }, 'p1'));
    const where = { desaAntiKorupsiId: 'p1', isActive: true };
    expect(prismaMock.folderDokumenDesaAntiKorupsi.findMany).toHaveBeenCalledWith({
      where,
      select: { id: true, nama: true, urutan: true },
    });
    expect(prismaMock.dokumenDesaAntiKorupsi.findMany).toHaveBeenCalledWith({
      where,
      select: { id: true, fileId: true, judul: true, urutan: true, folderId: true },
    });
  });
});

describe('findMany / findUnique', () => {
  it('findMany memakai _count (satu query) dan mengirim jumlahFolder/jumlahDokumen tanpa isi dokumen', async () => {
    prismaMock.desaAntiKorupsi.findMany.mockResolvedValueOnce([
      { id: 'p1', ...base, kategori: { name: 'K' }, _count: { folders: 3, dokumen: 12 } },
      { id: 'p2', ...base, kategori: { name: 'K' }, _count: { folders: 0, dokumen: 0 } },
    ]);
    prismaMock.desaAntiKorupsi.count.mockResolvedValueOnce(2);
    const res = await dakFindMany(ctx(undefined, undefined, { page: '1', limit: '10' }));

    expect(prismaMock.desaAntiKorupsi.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.desaAntiKorupsi.findMany.mock.calls[0][0].include).toBe(DESA_ANTI_KORUPSI_RINGKAS_INCLUDE);
    expect(res.data).toEqual([
      { id: 'p1', ...base, kategori: { name: 'K' }, jumlahFolder: 3, jumlahDokumen: 12 },
      { id: 'p2', ...base, kategori: { name: 'K' }, jumlahFolder: 0, jumlahDokumen: 0 },
    ]);
  });

  it('include ringkas menghitung folder & dokumen aktif saja; tidak memuat daftar dokumen', () => {
    expect(DESA_ANTI_KORUPSI_RINGKAS_INCLUDE._count.select).toEqual({
      folders: { where: { isActive: true } },
      dokumen: { where: { isActive: true } },
    });
    expect(DESA_ANTI_KORUPSI_RINGKAS_INCLUDE).not.toHaveProperty('dokumen');
  });

  it('findUnique memakai include detail dan mengirim folders + dokumenUmum', async () => {
    prismaMock.desaAntiKorupsi.findUnique.mockResolvedValueOnce(
      detailRow({
        folders: [{ id: 'fa', nama: 'Laporan', urutan: 0 }],
        dokumen: [{ id: 'a', judul: 'A', urutan: 0, fileId: 'xa', folderId: null, file: file('xa') }],
      }),
    );
    const res = await dakFindUnique(ctx(undefined, 'p1'));
    expect(prismaMock.desaAntiKorupsi.findUnique.mock.calls[0][0].include).toBe(DESA_ANTI_KORUPSI_DETAIL_INCLUDE);
    expect(res.data).toMatchObject({
      folders: [{ id: 'fa', nama: 'Laporan', urutan: 0, dokumen: [] }],
      dokumenUmum: [{ id: 'a', judul: 'A', urutan: 0, fileId: 'xa', file: file('xa') }],
    });
  });

  it('include detail: folder & dokumen aktif saja, urut urutan lalu createdAt, membawa link & mimeType', () => {
    const order = [{ urutan: 'asc' }, { createdAt: 'asc' }];
    expect(DESA_ANTI_KORUPSI_DETAIL_INCLUDE.folders.where).toEqual({ isActive: true });
    expect(DESA_ANTI_KORUPSI_DETAIL_INCLUDE.folders.orderBy).toEqual(order);
    expect(DESA_ANTI_KORUPSI_DETAIL_INCLUDE.dokumen.where).toEqual({ isActive: true });
    expect(DESA_ANTI_KORUPSI_DETAIL_INCLUDE.dokumen.orderBy).toEqual(order);
    expect(DESA_ANTI_KORUPSI_DETAIL_INCLUDE.dokumen.select.file.select).toMatchObject({ link: true, mimeType: true });
  });
});
