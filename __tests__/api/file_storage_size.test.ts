// @vitest-environment node
// FileStorage.size: upload mengisi ukuran asli, helper membaca ukuran dari MinIO (gzip → ISIZE),
// dan backfill hanya menyentuh baris size NULL serta lanjut saat satu berkas gagal.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import zlib from 'zlib';
import sharp from 'sharp';

const { minioMock, prismaMock } = vi.hoisted(() => ({
  minioMock: { putObject: vi.fn().mockResolvedValue(undefined) },
  prismaMock: { fileStorage: { create: vi.fn((args: { data: unknown }) => Promise.resolve(args.data)) } },
}));
vi.mock('@/lib/minio', () => ({ default: minioMock, MINIO_BUCKET: 'bucket' }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import fileStorageCreate from '@/app/api/[[...slugs]]/_lib/fileStorage/_lib/create';
import { readFileContent, resolveStoredSize, type StorageReader } from '@/lib/file-storage-size';
import { backfillFileSizes, type BackfillDb } from '@/lib/file-storage-backfill';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context Elysia tiruan minimal
const ctx = (file: File): any => ({ body: { name: file.name, file } });
const createdData = () => prismaMock.fileStorage.create.mock.calls.at(-1)?.[0].data as Record<string, unknown>;

async function* chunks(buf: Buffer) {
  yield buf.subarray(0, 3);
  yield buf.subarray(3);
}

/** MinIO tiruan dari peta nama objek → isi; objek tak dikenal melempar error ber-`code`. */
function fakeStorage(objects: Record<string, Buffer>): StorageReader {
  const get = (name: string) => {
    const buf = objects[name];
    if (!buf) throw Object.assign(new Error(`missing ${name}`), { code: 'NotFound' });
    return buf;
  };
  return {
    statObject: vi.fn(async (_b: string, name: string) => ({ size: get(name).length })),
    getPartialObject: vi.fn(async (_b: string, name: string, offset: number, length?: number) =>
      chunks(get(name).subarray(offset, length === undefined ? undefined : offset + length)),
    ),
    getObject: vi.fn(async (_b: string, name: string) => chunks(get(name))),
  };
}

beforeEach(() => vi.clearAllMocks());

describe('upload fileStorage/create mengisi size', () => {
  it('dokumen non-PDF disimpan ter-gzip tapi size = ukuran asli berkas', async () => {
    const content = 'isi dokumen '.repeat(200);
    const file = new File([content], 'laporan.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    await fileStorageCreate(ctx(file));
    const stored = minioMock.putObject.mock.calls[0][2] as Buffer;
    expect(stored.length).toBeLessThan(content.length);
    expect(createdData()).toMatchObject({ mimeType: 'application/gzip', size: content.length, realName: 'laporan.docx' });
  });

  it('PDF dan audio menyimpan size = ukuran berkas', async () => {
    await fileStorageCreate(ctx(new File(['%PDF-1.4 abc'], 'a.pdf', { type: 'application/pdf' })));
    expect(createdData()).toMatchObject({ mimeType: 'application/pdf', size: 12 });
    await fileStorageCreate(ctx(new File(['12345'], 'lagu.mp3', { type: 'audio/mpeg' })));
    expect(createdData()).toMatchObject({ category: 'audio', size: 5 });
  });

  it('gambar menyimpan size = ukuran WebP yang diunggah ke MinIO', async () => {
    const png = await sharp({ create: { width: 20, height: 20, channels: 3, background: '#f00' } }).png().toBuffer();
    await fileStorageCreate(ctx(new File([new Uint8Array(png)], 'foto.png', { type: 'image/png' })));
    const webp = minioMock.putObject.mock.calls[0][2] as Buffer;
    expect(createdData()).toMatchObject({ mimeType: 'image/webp', size: webp.length });
  });
});

describe('resolveStoredSize / readFileContent', () => {
  const asli = Buffer.from('dokumen asli '.repeat(50));
  const storage = fakeStorage({ 'document/x.gz': zlib.gzipSync(asli), 'document/y': Buffer.from('pdfbytes') });

  it('objek ter-gzip → ukuran asli dari trailer gzip; objek biasa → ukuran objek', async () => {
    expect(await resolveStoredSize(storage, 'b', { path: 'document', name: 'x.gz', mimeType: 'application/gzip' })).toBe(asli.length);
    expect(await resolveStoredSize(storage, 'b', { path: 'document', name: 'y', mimeType: 'application/pdf' })).toBe(8);
  });

  it('isi ter-gzip dibuka, isi biasa apa adanya', async () => {
    expect((await readFileContent(storage, 'b', { path: 'document', name: 'x.gz', mimeType: 'application/gzip' })).equals(asli)).toBe(true);
    expect((await readFileContent(storage, 'b', { path: 'document', name: 'y', mimeType: 'application/pdf' })).toString()).toBe('pdfbytes');
  });
});

describe('backfillFileSizes', () => {
  type Row = { id: string; path: string; name: string; mimeType: string; size: number | null };
  const makeDb = (rows: Row[]) => {
    const db = {
      findMany: vi.fn(async (args: Parameters<BackfillDb['findMany']>[0]) =>
        rows
          .filter((r) => r.size === null && (!args.where.id || r.id > args.where.id.gt))
          .sort((a, b) => a.id.localeCompare(b.id))
          .slice(0, args.take)
          .map(({ id, path, name, mimeType }) => ({ id, path, name, mimeType })),
      ),
      update: vi.fn(async (args: Parameters<BackfillDb['update']>[0]) => {
        rows.find((r) => r.id === args.where.id)!.size = args.data.size;
      }),
    };
    return db;
  };

  it('hanya mengisi baris size NULL, per batch, dan lanjut saat satu objek gagal', async () => {
    const rows: Row[] = [
      { id: 'a', path: 'document', name: 'a', mimeType: 'application/pdf', size: null },
      { id: 'b', path: 'document', name: 'hilang', mimeType: 'application/pdf', size: null },
      { id: 'c', path: 'image', name: 'c.webp', mimeType: 'image/webp', size: 999 },
      { id: 'd', path: 'image', name: 'd.webp', mimeType: 'image/webp', size: null },
    ];
    const db = makeDb(rows);
    const storage = fakeStorage({ 'document/a': Buffer.alloc(10), 'image/d.webp': Buffer.alloc(7), 'image/c.webp': Buffer.alloc(1) });
    const log = vi.fn();

    const result = await backfillFileSizes({ db, storage, bucket: 'b', batchSize: 2, log });

    expect(result).toEqual({ updated: 2, failed: 1, failedIds: ['b'] });
    expect(rows.map((r) => r.size)).toEqual([10, null, 999, 7]);
    expect(db.update).toHaveBeenCalledTimes(2);
    expect(db.update).not.toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'c' } }));
    expect(db.findMany.mock.calls.map((c) => c[0].where)).toEqual([
      { size: null },
      { size: null, id: { gt: 'b' } },
      { size: null, id: { gt: 'd' } },
    ]);
    expect(log).toHaveBeenCalledWith('gagal id=b (NotFound)');
  });

  it('idempoten: dijalankan ulang setelah semua terisi tidak meng-update apa pun', async () => {
    const rows: Row[] = [{ id: 'a', path: 'document', name: 'a', mimeType: 'application/pdf', size: 10 }];
    const db = makeDb(rows);
    const result = await backfillFileSizes({ db, storage: fakeStorage({}), bucket: 'b' });
    expect(result).toEqual({ updated: 0, failed: 0, failedIds: [] });
    expect(db.update).not.toHaveBeenCalled();
  });
});
