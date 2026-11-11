// @vitest-environment node
// API Berita: create/update menerima tanggalTerbit opsional (tidak valid = 400 sebelum DB/MinIO),
// update tanpa tanggal tidak menyentuh kolomnya, dan semua list (desa/berita, search, news/latest)
// diurutkan tanggalTerbit desc, createdAt desc.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BERITA_LIST_ORDER_BY } from '@/lib/berita-data';

const prismaMock = vi.hoisted(() => ({
  berita: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
  },
  pengumuman: { findMany: vi.fn() },
  fileStorage: { delete: vi.fn() },
}));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
const minioMock = vi.hoisted(() => ({ removeObject: vi.fn() }));
vi.mock('@/lib/minio', () => ({ default: minioMock, MINIO_BUCKET: 'test-bucket' }));

import beritaCreate from '@/app/api/[[...slugs]]/_lib/desa/berita/create';
import beritaUpdate from '@/app/api/[[...slugs]]/_lib/desa/berita/updt';
import beritaFindMany from '@/app/api/[[...slugs]]/_lib/desa/berita/find-many';
import beritaFindFirst from '@/app/api/[[...slugs]]/_lib/desa/berita/findFirst';
import findRecentBerita from '@/app/api/[[...slugs]]/_lib/desa/berita/findRecent';
import searchFindMany from '@/app/api/[[...slugs]]/_lib/search/findMany';
import { GET as newsLatest } from '@/app/api/news/latest/route';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context Elysia tiruan minimal
const ctx = (body: unknown, id?: string, query: Record<string, string> = {}): any => ({
  body,
  query,
  params: id ? { id } : {},
  set: { status: 200 },
});

// test-only: body field lama
const base = {
  judul: 'Pelatihan UMKM',
  deskripsi: '<p>Ringkas</p>',
  content: '<p>Isi</p>',
  kategoriBeritaId: 'k1',
  imageId: 'img',
  imageIds: [] as string[],
};
const agustusWita = new Date('2026-08-16T16:00:00.000Z');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('create', () => {
  it('menyimpan tanggalTerbit (WITA) dan respons membawa id + tanggalTerbit (field lama tetap)', async () => {
    prismaMock.berita.create.mockResolvedValueOnce({ id: 'b1', tanggalTerbit: agustusWita });
    const res = await beritaCreate(ctx({ ...base, tanggalTerbit: '2026-08-17' }));

    expect(res).toMatchObject({ success: true, data: { ...base, id: 'b1', tanggalTerbit: agustusWita } });
    expect(prismaMock.berita.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ judul: 'Pelatihan UMKM', imageId: 'img', tanggalTerbit: agustusWita }),
      select: { id: true, tanggalTerbit: true },
    });
  });

  it('body lama tanpa tanggalTerbit → kolom tidak dikirim (default DB sekarang)', async () => {
    prismaMock.berita.create.mockResolvedValueOnce({ id: 'b2', tanggalTerbit: new Date() });
    await beritaCreate(ctx(base));
    expect(prismaMock.berita.create.mock.calls[0][0].data).not.toHaveProperty('tanggalTerbit');
  });

  it('tanggal tidak valid → 400 tanpa menyentuh DB', async () => {
    const c = ctx({ ...base, tanggalTerbit: '2026-02-31' });
    const res = await beritaCreate(c);
    expect(c.set.status).toBe(400);
    expect(res).toEqual({ success: false, message: 'Tanggal terbit tidak valid: "2026-02-31"' });
    expect(prismaMock.berita.create).not.toHaveBeenCalled();
  });
});

describe('update', () => {
  const existing = { id: 'b1', imageId: 'img', image: { id: 'img', path: 'p', name: 'n' }, images: [], kategoriBerita: null };

  it('tanggal dikirim → diubah; respons membawa tanggalTerbit', async () => {
    prismaMock.berita.findUnique.mockResolvedValueOnce(existing);
    prismaMock.berita.update.mockResolvedValueOnce({ id: 'b1', tanggalTerbit: agustusWita });
    const res = await beritaUpdate(ctx({ ...base, tanggalTerbit: '2026-08-17' }, 'b1'));

    expect(res.status).toBe(200);
    expect((await res.json()).data.tanggalTerbit).toBe(agustusWita.toISOString());
    expect(prismaMock.berita.update.mock.calls[0][0].data.tanggalTerbit).toEqual(agustusWita);
  });

  it('tanggal kosong → kolom tidak diubah (jam hasil backfill aman)', async () => {
    prismaMock.berita.findUnique.mockResolvedValueOnce(existing);
    prismaMock.berita.update.mockResolvedValueOnce({ id: 'b1' });
    await beritaUpdate(ctx({ ...base, tanggalTerbit: '' }, 'b1'));
    expect(prismaMock.berita.update.mock.calls[0][0].data).not.toHaveProperty('tanggalTerbit');
  });

  it('tanggal tidak valid → 400 sebelum DB & sebelum gambar lama dihapus', async () => {
    const res = await beritaUpdate(ctx({ ...base, imageId: 'img-baru', tanggalTerbit: 'kemarin' }, 'b1'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: 'Tanggal terbit tidak valid: "kemarin"' });
    expect(prismaMock.berita.findUnique).not.toHaveBeenCalled();
    expect(minioMock.removeObject).not.toHaveBeenCalled();
    expect(prismaMock.berita.update).not.toHaveBeenCalled();
  });
});

describe('urutan list', () => {
  it('find-many, find-first, find-recent memakai BERITA_LIST_ORDER_BY', async () => {
    prismaMock.berita.findMany.mockResolvedValue([]);
    prismaMock.berita.count.mockResolvedValue(0);
    prismaMock.berita.findFirst.mockResolvedValue(null);

    await beritaFindMany(ctx(undefined, undefined, { page: '1', limit: '5' }));
    await beritaFindFirst(ctx(undefined));
    await findRecentBerita();

    expect(prismaMock.berita.findMany.mock.calls[0][0]).toMatchObject({ orderBy: BERITA_LIST_ORDER_BY, take: 5 });
    expect(prismaMock.berita.findFirst.mock.calls[0][0].orderBy).toBe(BERITA_LIST_ORDER_BY);
    expect(prismaMock.berita.findMany.mock.calls[1][0]).toMatchObject({ orderBy: BERITA_LIST_ORDER_BY, take: 4 });
  });

  it('search type=berita diurutkan tanggalTerbit', async () => {
    prismaMock.berita.findMany.mockResolvedValueOnce([]);
    await searchFindMany(ctx(undefined, undefined, { query: 'umkm', type: 'berita' }));
    expect(prismaMock.berita.findMany.mock.calls[0][0].orderBy).toBe(BERITA_LIST_ORDER_BY);
  });

  it('news/latest: berita diurutkan & diberi timestamp tanggalTerbit', async () => {
    prismaMock.berita.findMany.mockResolvedValueOnce([
      { id: 'b1', judul: 'A', content: '-', createdAt: new Date('2026-11-11T02:00:00Z'), tanggalTerbit: agustusWita, kategoriBerita: null },
    ]);
    prismaMock.pengumuman.findMany.mockResolvedValueOnce([]);
    const body = await (await newsLatest()).json();

    expect(prismaMock.berita.findMany.mock.calls[0][0].orderBy).toBe(BERITA_LIST_ORDER_BY);
    expect(body.news[0]).toMatchObject({ id: 'b1', type: 'berita', timestamp: agustusWita.toISOString() });
  });
});
