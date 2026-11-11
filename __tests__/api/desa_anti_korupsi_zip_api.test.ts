// @vitest-environment node
// Handler GET /api/landingpage/desaantikorupsi/:id/zip (publik): 200 ZIP berisi entri benar,
// 404 program/folder tidak ada, 413 bila total ukuran melebihi batas.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdmZip from 'adm-zip';
import zlib from 'zlib';

const { prismaMock, minioMock, objects } = vi.hoisted(() => {
  const objects = new Map<string, Buffer>();
  async function* stream(buf: Buffer) {
    yield buf;
  }
  const get = (name: string) => {
    const buf = objects.get(name);
    if (!buf) throw Object.assign(new Error('missing'), { code: 'NotFound' });
    return buf;
  };
  return {
    objects,
    prismaMock: { desaAntiKorupsi: { findFirst: vi.fn() } },
    minioMock: {
      statObject: vi.fn(async (_b: string, name: string) => ({ size: get(name).length })),
      getPartialObject: vi.fn(async (_b: string, name: string, offset: number, length: number) =>
        stream(get(name).subarray(offset, offset + length)),
      ),
      getObject: vi.fn(async (_b: string, name: string) => stream(get(name))),
    },
  };
});
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/lib/minio', () => ({ default: minioMock, MINIO_BUCKET: 'bucket' }));

import dakZip from '@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/zip';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context Elysia tiruan minimal
const ctx = (id: string, query: Record<string, string> = {}): any => ({ params: { id }, query, set: { status: 200, headers: {} } });

const names = (zip: AdmZip) => zip.getEntries().map((e) => e.entryName).sort();
const pdf = Buffer.from('%PDF isi laporan');
const docx = Buffer.from('isi docx asli '.repeat(20));
const file = (name: string, mimeType: string, realName: string, size: number | null) => ({ path: 'document', name, mimeType, realName, size });

const program = {
  name: 'Program Transparansi 2025',
  folders: [
    { id: 'f1', nama: 'Laporan Keuangan' },
    { id: 'f2', nama: 'Kosong' },
  ],
  dokumen: [
    { judul: 'Laporan', folderId: 'f1', file: file('a', 'application/pdf', 'a.pdf', pdf.length) },
    { judul: 'Lampiran', folderId: 'f1', file: file('b.gz', 'application/gzip', 'b.docx', null) },
    { judul: 'SK Kades', folderId: null, file: file('c', 'application/pdf', 'c.pdf', pdf.length) },
    { judul: 'SK Kades', folderId: 'folder-nonaktif', file: file('a', 'application/pdf', 'a.pdf', pdf.length) },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  objects.clear();
  objects.set('document/a', pdf);
  objects.set('document/b.gz', zlib.gzipSync(docx));
  objects.set('document/c', pdf);
  prismaMock.desaAntiKorupsi.findFirst.mockResolvedValue(program);
});
afterEach(() => vi.unstubAllEnvs());

describe('GET /:id/zip', () => {
  it('tanpa folder: 200 application/zip, subfolder per folder + "Umum", gzip dibuka, nama kembar di-dedupe', async () => {
    const c = ctx('p1');
    const res = (await dakZip(c)) as Buffer;

    expect(c.set.status).toBe(200);
    expect(c.set.headers['Content-Type']).toBe('application/zip');
    expect(c.set.headers['Content-Length']).toBe(String(res.length));
    expect(c.set.headers['Content-Disposition']).toBe(
      `attachment; filename="program-transparansi-2025.zip"; filename*=UTF-8''program-transparansi-2025.zip`,
    );
    const zip = new AdmZip(res);
    // AdmZip mengurutkan entri menurut nama saat menulis arsip → bandingkan sebagai himpunan.
    expect(names(zip)).toEqual([
      'Laporan Keuangan/Lampiran.docx',
      'Laporan Keuangan/Laporan.pdf',
      'Umum/SK Kades (2).pdf', // folder nonaktif → "Umum" (sama dengan tampilan detail), nama kembar di-dedupe
      'Umum/SK Kades.pdf',
    ]);
    expect(zip.readFile('Laporan Keuangan/Lampiran.docx')?.equals(docx)).toBe(true);
    expect(zip.readFile('Umum/SK Kades.pdf')?.equals(pdf)).toBe(true);

    expect(prismaMock.desaAntiKorupsi.findFirst.mock.calls[0][0].where).toEqual({ id: 'p1', isActive: true });
    const sel = prismaMock.desaAntiKorupsi.findFirst.mock.calls[0][0].select;
    expect(sel.dokumen.where).toEqual({ isActive: true });
    expect(sel.folders.where).toEqual({ isActive: true });
    // size null → fallback statObject (+ trailer gzip); size terisi tidak di-stat
    expect(minioMock.statObject).toHaveBeenCalledTimes(1);
    expect(minioMock.statObject).toHaveBeenCalledWith('bucket', 'document/b.gz');
  });

  it('?folder=<id>: hanya isi folder itu di akar arsip, nama berkas + slug folder', async () => {
    const c = ctx('p1', { folder: 'f1' });
    const zip = new AdmZip((await dakZip(c)) as Buffer);
    expect(names(zip)).toEqual(['Lampiran.docx', 'Laporan.pdf']);
    expect(c.set.headers['Content-Disposition']).toContain('filename="program-transparansi-2025-laporan-keuangan.zip"');
  });

  it('?folder=umum: dokumen tanpa folder aktif', async () => {
    const c = ctx('p1', { folder: 'umum' });
    const zip = new AdmZip((await dakZip(c)) as Buffer);
    expect(names(zip)).toEqual(['SK Kades (2).pdf', 'SK Kades.pdf']);
    expect(c.set.headers['Content-Disposition']).toContain('program-transparansi-2025-umum.zip');
  });

  it('program tidak ada / tidak aktif → 404', async () => {
    prismaMock.desaAntiKorupsi.findFirst.mockResolvedValueOnce(null);
    const c = ctx('hilang');
    expect(await dakZip(c)).toEqual({ success: false, message: 'Program desa anti korupsi tidak ditemukan' });
    expect(c.set.status).toBe(404);
  });

  it('folder tidak ada / tidak aktif → 404; folder kosong → 404', async () => {
    const c = ctx('p1', { folder: 'folder-nonaktif' });
    expect(await dakZip(c)).toEqual({ success: false, message: 'Folder dokumen tidak ditemukan' });
    expect(c.set.status).toBe(404);

    const kosong = ctx('p1', { folder: 'f2' });
    expect(await dakZip(kosong)).toEqual({ success: false, message: 'Tidak ada dokumen untuk diunduh' });
    expect(kosong.set.status).toBe(404);
    expect(minioMock.getObject).not.toHaveBeenCalled();
  });

  it('total ukuran melebihi DAK_ZIP_MAX_BYTES → 413 tanpa mengunduh isi berkas', async () => {
    vi.stubEnv('DAK_ZIP_MAX_BYTES', String(pdf.length * 2 - 1)); // folder Umum = 2 × pdf
    const c = ctx('p1', { folder: 'umum' });
    expect(await dakZip(c)).toEqual({
      success: false,
      message: expect.stringContaining('unduh per dokumen'),
    });
    expect(c.set.status).toBe(413);

    const besar = ctx('p1');
    await dakZip(besar);
    expect(besar.set.status).toBe(413);
    expect(minioMock.getObject).not.toHaveBeenCalled();
  });

  it('objek MinIO hilang → 502 dengan pesan, bukan ZIP setengah jadi', async () => {
    objects.delete('document/c');
    const c = ctx('p1', { folder: 'umum' });
    expect(await dakZip(c)).toEqual({ success: false, message: 'Gagal mengambil berkas dokumen dari penyimpanan' });
    expect(c.set.status).toBe(502);
  });
});
