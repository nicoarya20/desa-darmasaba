// @vitest-environment node
// API Pengumuman: create/update menerima lampiran opsional (validasi 400 sebelum menyentuh DB),
// update tidak menyentuh lampiran yang tidak dikirim, list paginated + urut tanggalTerbit.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PENGUMUMAN_DETAIL_INCLUDE,
  PENGUMUMAN_LIST_INCLUDE,
  PENGUMUMAN_LIST_ORDER_BY,
} from '@/lib/pengumuman-lampiran';

const prismaMock = vi.hoisted(() => ({
  pengumuman: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
  },
  fileStorage: { findMany: vi.fn() },
}));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import { pengumumanCreate } from '@/app/api/[[...slugs]]/_lib/desa/pengumuman/create';
import pengumumanUpdate from '@/app/api/[[...slugs]]/_lib/desa/pengumuman/updt';
import pengumumanFindMany from '@/app/api/[[...slugs]]/_lib/desa/pengumuman/find-many';
import pengumumanFindById from '@/app/api/[[...slugs]]/_lib/desa/pengumuman/find-by-id';
import pengumumanFindRecent from '@/app/api/[[...slugs]]/_lib/desa/pengumuman/findRecent';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context Elysia tiruan minimal
const ctx = (body: unknown, id?: string, query: Record<string, string> = {}): any => ({
  body,
  query,
  params: id ? { id } : {},
  set: { status: 200 },
});

// test-only: body field lama
const base = { judul: 'Lelang', deskripsi: 'Lihat lampiran', content: '<p>-</p>', categoryPengumumanId: 'k1' };
const rows = [
  { id: 'img', mimeType: 'image/webp' },
  { id: 'g1', mimeType: 'image/webp' },
  { id: 'd1', mimeType: 'application/pdf' },
];

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.fileStorage.findMany.mockResolvedValue(rows);
});

describe('create', () => {
  it('menyimpan lampiran + tanggal dan mengembalikan id baru (field lama tetap ada)', async () => {
    prismaMock.pengumuman.create.mockResolvedValueOnce({ id: 'p1' });
    const c = ctx({ ...base, imageId: 'img', imageIds: ['g1'], dokumenIds: ['d1'], tanggalTerbit: '2024-03-05' });
    const res = await pengumumanCreate(c);

    expect(res).toMatchObject({ success: true, data: { ...base, id: 'p1' } });
    expect(prismaMock.fileStorage.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['img', 'g1', 'd1'] }, isActive: true },
      select: { id: true, mimeType: true },
    });
    expect(prismaMock.pengumuman.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        imageId: 'img',
        tanggalTerbit: new Date('2024-03-04T16:00:00.000Z'),
        images: { connect: [{ id: 'g1' }] },
        dokumen: { connect: [{ id: 'd1' }] },
      }),
      select: { id: true },
    });
  });

  it('body lama tanpa lampiran tetap diterima tanpa query FileStorage', async () => {
    prismaMock.pengumuman.create.mockResolvedValueOnce({ id: 'p2' });
    const res = await pengumumanCreate(ctx(base));
    expect(res).toMatchObject({ success: true });
    expect(prismaMock.fileStorage.findMany).not.toHaveBeenCalled();
  });

  it('dokumen bukan PDF → 400 dan tidak membuat pengumuman', async () => {
    prismaMock.fileStorage.findMany.mockResolvedValueOnce([{ id: 'd1', mimeType: 'application/gzip' }]);
    const c = ctx({ ...base, dokumenIds: ['d1'] });
    const res = await pengumumanCreate(c);
    expect(c.set.status).toBe(400);
    expect(res).toMatchObject({ success: false, message: expect.stringContaining('PDF') });
    expect(prismaMock.pengumuman.create).not.toHaveBeenCalled();
  });

  it('tanggal tidak valid → 400 tanpa query DB', async () => {
    const c = ctx({ ...base, tanggalTerbit: 'besok' });
    await pengumumanCreate(c);
    expect(c.set.status).toBe(400);
    expect(prismaMock.fileStorage.findMany).not.toHaveBeenCalled();
  });
});

describe('update', () => {
  it('lampiran yang tidak dikirim tidak diubah; respons membawa detail lengkap', async () => {
    prismaMock.pengumuman.findUnique.mockResolvedValueOnce({ id: 'p1' });
    prismaMock.pengumuman.update.mockResolvedValueOnce({ id: 'p1', ...base });
    const res = (await pengumumanUpdate(ctx(base, 'p1'))) as Response;

    expect(res.status).toBe(200);
    const arg = prismaMock.pengumuman.update.mock.calls[0][0];
    expect(arg.include).toBe(PENGUMUMAN_DETAIL_INCLUDE);
    expect(arg.data).not.toHaveProperty('images');
    expect(arg.data).not.toHaveProperty('dokumen');
    expect(arg.data).not.toHaveProperty('imageId');
    expect(arg.data).not.toHaveProperty('tanggalTerbit');
  });

  it('array lampiran = set final; imageId null menghapus gambar utama', async () => {
    prismaMock.pengumuman.findUnique.mockResolvedValueOnce({ id: 'p1' });
    prismaMock.pengumuman.update.mockResolvedValueOnce({ id: 'p1' });
    await pengumumanUpdate(ctx({ ...base, imageId: null, imageIds: [], dokumenIds: ['d1'] }, 'p1'));
    expect(prismaMock.pengumuman.update.mock.calls[0][0].data).toMatchObject({
      imageId: null,
      images: { set: [] },
      dokumen: { set: [{ id: 'd1' }] },
    });
  });

  it('404 bila pengumuman tidak ada, 400 bila galeri melebihi batas', async () => {
    prismaMock.pengumuman.findUnique.mockResolvedValueOnce(null);
    expect(((await pengumumanUpdate(ctx(base, 'x'))) as Response).status).toBe(404);

    prismaMock.pengumuman.findUnique.mockResolvedValueOnce({ id: 'p1' });
    const res = (await pengumumanUpdate(ctx({ ...base, imageIds: Array.from({ length: 11 }, (_, i) => `g${i}`) }, 'p1'))) as Response;
    expect(res.status).toBe(400);
    expect(prismaMock.pengumuman.update).not.toHaveBeenCalled();
  });
});

describe('baca', () => {
  it('find-many paginated, include ringan, urut tanggalTerbit lalu createdAt', async () => {
    prismaMock.pengumuman.findMany.mockResolvedValueOnce([]);
    prismaMock.pengumuman.count.mockResolvedValueOnce(25);
    const res = await pengumumanFindMany(ctx(undefined, undefined, { page: '2', limit: '10' }));

    expect(res).toMatchObject({ success: true, page: 2, limit: 10, total: 25, totalPages: 3 });
    expect(prismaMock.pengumuman.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: PENGUMUMAN_LIST_INCLUDE, orderBy: PENGUMUMAN_LIST_ORDER_BY, skip: 10, take: 10 }),
    );
  });

  it('find-recent memakai urutan yang sama', async () => {
    prismaMock.pengumuman.findMany.mockResolvedValueOnce([]);
    await pengumumanFindRecent();
    expect(prismaMock.pengumuman.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: PENGUMUMAN_LIST_ORDER_BY, include: PENGUMUMAN_LIST_INCLUDE }),
    );
  });

  it('find-by-id membawa gambar, galeri, dan dokumen', async () => {
    prismaMock.pengumuman.findUnique.mockResolvedValueOnce({ id: 'p1' });
    await pengumumanFindById(ctx(undefined, 'p1'));
    expect(prismaMock.pengumuman.findUnique).toHaveBeenCalledWith({ where: { id: 'p1' }, include: PENGUMUMAN_DETAIL_INCLUDE });
  });
});
