// @vitest-environment node
// API Desa Anti Korupsi: create/update menerima folder dokumen; update = sinkronisasi set dokumen.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DESA_ANTI_KORUPSI_INCLUDE } from '@/lib/desa-anti-korupsi-dokumen';

const prismaMock = vi.hoisted(() => {
  const dokumen = { findMany: vi.fn(), updateMany: vi.fn(), update: vi.fn() };
  const program = { create: vi.fn(), update: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), count: vi.fn() };
  const fileStorage = { count: vi.fn() };
  const tx = { dokumenDesaAntiKorupsi: dokumen, desaAntiKorupsi: program };
  return {
    desaAntiKorupsi: program,
    dokumenDesaAntiKorupsi: dokumen,
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

beforeEach(() => vi.clearAllMocks());

describe('create', () => {
  it('membuat program + dokumen bersarang dan mengembalikan include dokumen', async () => {
    prismaMock.fileStorage.count.mockResolvedValueOnce(2);
    prismaMock.desaAntiKorupsi.create.mockResolvedValueOnce({ id: 'p1', dokumen: [] });
    const c = ctx({
      ...base,
      dokumen: [
        { fileId: 'f1', judul: 'Satu', urutan: 0 },
        { fileId: 'f2', judul: 'Dua', urutan: 1 },
      ],
    });
    const res = await dakCreate(c);

    expect(res).toMatchObject({ success: true });
    expect(prismaMock.fileStorage.count).toHaveBeenCalledWith({
      where: { id: { in: ['f1', 'f2'] }, isActive: true },
    });
    expect(prismaMock.desaAntiKorupsi.create).toHaveBeenCalledWith({
      data: {
        ...base,
        dokumen: {
          create: [
            { fileId: 'f1', judul: 'Satu', urutan: 0 },
            { fileId: 'f2', judul: 'Dua', urutan: 1 },
          ],
        },
      },
      include: DESA_ANTI_KORUPSI_INCLUDE,
    });
  });

  it('tanpa dokumen → folder kosong, tidak cek FileStorage', async () => {
    prismaMock.desaAntiKorupsi.create.mockResolvedValueOnce({ id: 'p1' });
    await dakCreate(ctx(base));
    expect(prismaMock.fileStorage.count).not.toHaveBeenCalled();
    expect(prismaMock.desaAntiKorupsi.create.mock.calls[0][0].data.dokumen).toEqual({ create: [] });
  });

  it('payload dokumen tidak valid → 400, tidak menyentuh DB', async () => {
    const c = ctx({ ...base, dokumen: [{ fileId: 'f1', judul: '', urutan: 0 }] });
    const res = await dakCreate(c);
    expect(c.set.status).toBe(400);
    expect(res).toEqual({ success: false, message: 'Dokumen #1: judul wajib diisi' });
    expect(prismaMock.desaAntiKorupsi.create).not.toHaveBeenCalled();
  });

  it('dokumen dengan id pada create → 400 (program baru belum punya dokumen)', async () => {
    const c = ctx({ ...base, dokumen: [{ id: 'd1', fileId: 'f1', judul: 'A', urutan: 0 }] });
    await dakCreate(c);
    expect(c.set.status).toBe(400);
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
  it('tanpa field dokumen → isi folder tidak disentuh (tanpa transaksi)', async () => {
    prismaMock.desaAntiKorupsi.update.mockResolvedValueOnce({ id: 'p1' });
    const res = await dakUpdate(ctx(base, 'p1'));
    expect(res).toMatchObject({ success: true });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.dokumenDesaAntiKorupsi.findMany).not.toHaveBeenCalled();
    expect(prismaMock.desaAntiKorupsi.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: base,
      include: DESA_ANTI_KORUPSI_INCLUDE,
    });
  });

  it('dengan dokumen → soft delete yang dibuang, update urutan/judul, create baru dalam satu transaksi', async () => {
    prismaMock.dokumenDesaAntiKorupsi.findMany.mockResolvedValueOnce([
      { id: 'a', fileId: 'fa', judul: 'A', urutan: 0 },
      { id: 'b', fileId: 'fb', judul: 'B', urutan: 1 },
    ]);
    prismaMock.fileStorage.count.mockResolvedValueOnce(1);
    prismaMock.desaAntiKorupsi.update.mockResolvedValueOnce({ id: 'p1', dokumen: ['final'] });

    const res = await dakUpdate(
      ctx(
        {
          ...base,
          dokumen: [
            { fileId: 'fn', judul: 'Baru', urutan: 0 },
            { id: 'b', fileId: 'fb', judul: 'B', urutan: 1 },
          ],
        },
        'p1',
      ),
    );

    expect(res).toEqual({
      success: true,
      message: 'Desa anti korupsi berhasil diperbarui',
      data: { id: 'p1', dokumen: ['final'] },
    });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.dokumenDesaAntiKorupsi.findMany).toHaveBeenCalledWith({
      where: { desaAntiKorupsiId: 'p1', isActive: true },
      select: { id: true, fileId: true, judul: true, urutan: true },
    });
    const softDelete = prismaMock.dokumenDesaAntiKorupsi.updateMany.mock.calls[0][0];
    expect(softDelete.where).toEqual({ id: { in: ['a'] }, desaAntiKorupsiId: 'p1' });
    expect(softDelete.data.isActive).toBe(false);
    expect(softDelete.data.deletedAt).toBeInstanceOf(Date);
    // b tidak berubah judul/urutan → tidak di-update
    expect(prismaMock.dokumenDesaAntiKorupsi.update).not.toHaveBeenCalled();
    expect(prismaMock.desaAntiKorupsi.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { ...base, dokumen: { create: [{ fileId: 'fn', judul: 'Baru', urutan: 0 }] } },
      include: DESA_ANTI_KORUPSI_INCLUDE,
    });
  });

  it('mengubah urutan dokumen lama → update per dokumen', async () => {
    prismaMock.dokumenDesaAntiKorupsi.findMany.mockResolvedValueOnce([
      { id: 'a', fileId: 'fa', judul: 'A', urutan: 0 },
      { id: 'b', fileId: 'fb', judul: 'B', urutan: 1 },
    ]);
    prismaMock.desaAntiKorupsi.update.mockResolvedValueOnce({ id: 'p1' });
    await dakUpdate(
      ctx(
        {
          ...base,
          dokumen: [
            { id: 'b', fileId: 'fb', judul: 'B', urutan: 0 },
            { id: 'a', fileId: 'fa', judul: 'A', urutan: 1 },
          ],
        },
        'p1',
      ),
    );
    expect(prismaMock.dokumenDesaAntiKorupsi.update.mock.calls.map((c) => c[0])).toEqual([
      { where: { id: 'b' }, data: { judul: 'B', urutan: 0 } },
      { where: { id: 'a' }, data: { judul: 'A', urutan: 1 } },
    ]);
    expect(prismaMock.fileStorage.count).not.toHaveBeenCalled();
  });

  it('id dokumen milik program lain → 400 tanpa transaksi', async () => {
    prismaMock.dokumenDesaAntiKorupsi.findMany.mockResolvedValueOnce([]);
    const c = ctx({ ...base, dokumen: [{ id: 'asing', fileId: 'fx', judul: 'X', urutan: 0 }] }, 'p1');
    const res = await dakUpdate(c);
    expect(c.set.status).toBe(400);
    expect(res).toEqual({ success: false, message: 'Dokumen tidak ditemukan pada program ini' });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});

describe('findMany / findUnique', () => {
  it('memakai include dokumen aktif urut urutan', async () => {
    prismaMock.desaAntiKorupsi.findMany.mockResolvedValueOnce([]);
    prismaMock.desaAntiKorupsi.count.mockResolvedValueOnce(0);
    await dakFindMany(ctx(undefined, undefined, { page: '1', limit: '10' }));
    expect(prismaMock.desaAntiKorupsi.findMany.mock.calls[0][0].include).toBe(DESA_ANTI_KORUPSI_INCLUDE);

    prismaMock.desaAntiKorupsi.findUnique.mockResolvedValueOnce({ id: 'p1' });
    await dakFindUnique(ctx(undefined, 'p1'));
    expect(prismaMock.desaAntiKorupsi.findUnique.mock.calls[0][0].include).toBe(DESA_ANTI_KORUPSI_INCLUDE);
  });

  it('include hanya dokumen aktif, urut urutan lalu createdAt, membawa link & mimeType', () => {
    expect(DESA_ANTI_KORUPSI_INCLUDE.dokumen.where).toEqual({ isActive: true });
    expect(DESA_ANTI_KORUPSI_INCLUDE.dokumen.orderBy).toEqual([{ urutan: 'asc' }, { createdAt: 'asc' }]);
    expect(DESA_ANTI_KORUPSI_INCLUDE.dokumen.select.file.select).toMatchObject({ link: true, mimeType: true });
  });
});
