// @vitest-environment node
// Lomba 2.5: berkas PDF di Dasar Hukum PPID dan Daftar Informasi Publik. Handler diuji lewat modul Elysia dengan
// prisma & penghapus berkas di-mock: `fileId` valid diterima, yang tidak ada di FileStorage ditolak (400), berkas
// lama dihapus SETELAH relasi dipindah, dan respons membawa `file` (id, link, realName).
import Elysia from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { fileStorage, dasarHukum, daftar, removeStoredFile } = vi.hoisted(() => ({
  fileStorage: { findUnique: vi.fn() },
  dasarHukum: { findFirst: vi.fn(), findUnique: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn() },
  daftar: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn(), delete: vi.fn() },
  removeStoredFile: vi.fn(),
}));
vi.mock('@/lib/prisma', () => ({
  default: { fileStorage, dasarHukumPPID: dasarHukum, daftarInformasiPublik: daftar },
}));
vi.mock('@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile', () => ({ default: removeStoredFile }));

import DaftarInformasiPublik from '@/app/api/[[...slugs]]/_lib/ppid/daftar_informasi_publik';
import DasarHukumPPID from '@/app/api/[[...slugs]]/_lib/ppid/dasar_hukum';
import { PESAN_FILE_PPID_TIDAK_ADA, PPID_FILE_SELECT } from '@/app/api/[[...slugs]]/_lib/ppid/ppid-file';

const app = new Elysia({ prefix: '/api/ppid' }).use(DasarHukumPPID).use(DaftarInformasiPublik);
const BASE = 'http://localhost/api/ppid';
const send = (method: string, path: string, body?: unknown) =>
  app.handle(
    new Request(`${BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );

// test-only: berkas dan baris rekaan.
const FILE = { id: 'file-baru', link: '/api/fileStorage/findUnique/perbup.pdf', realName: 'perbup.pdf' };
const FORM_HUKUM = { id: '1', judul: 'Dasar Hukum', content: '<p>UU 14/2008</p>' };
const FORM_DAFTAR = { jenisInformasi: 'Profil Desa', deskripsi: '<p>Profil</p>', tanggal: '2026-11-01' };
const orderOf = (fn: ReturnType<typeof vi.fn>) => fn.mock.invocationCallOrder[0];

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('POST /dasarhukumppid/update', () => {
  it('menyimpan fileId yang ada di FileStorage', async () => {
    fileStorage.findUnique.mockResolvedValue({ id: FILE.id });
    dasarHukum.findUnique.mockResolvedValue({ fileId: null });
    const res = await send('POST', '/dasarhukumppid/update', { ...FORM_HUKUM, fileId: FILE.id });
    expect(res.status).toBe(200);
    expect(dasarHukum.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { judul: FORM_HUKUM.judul, content: FORM_HUKUM.content, fileId: FILE.id },
    });
    expect(removeStoredFile).not.toHaveBeenCalled();
  });

  it('menolak fileId yang tidak ada di FileStorage dan tidak menulis apa pun', async () => {
    fileStorage.findUnique.mockResolvedValue(null);
    const res = await send('POST', '/dasarhukumppid/update', { ...FORM_HUKUM, fileId: 'tidak-ada' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_FILE_PPID_TIDAK_ADA });
    expect(dasarHukum.update).not.toHaveBeenCalled();
    expect(removeStoredFile).not.toHaveBeenCalled();
  });

  it('tanpa fileId: teks saja yang berubah, berkas lama dibiarkan', async () => {
    const res = await send('POST', '/dasarhukumppid/update', FORM_HUKUM);
    expect(res.status).toBe(200);
    expect(dasarHukum.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { judul: FORM_HUKUM.judul, content: FORM_HUKUM.content },
    });
    expect(fileStorage.findUnique).not.toHaveBeenCalled();
    expect(removeStoredFile).not.toHaveBeenCalled();
  });

  it('mengganti berkas: berkas lama dihapus setelah relasi dipindah', async () => {
    fileStorage.findUnique.mockResolvedValue({ id: FILE.id });
    dasarHukum.findUnique.mockResolvedValue({ fileId: 'file-lama' });
    await send('POST', '/dasarhukumppid/update', { ...FORM_HUKUM, fileId: FILE.id });
    expect(removeStoredFile).toHaveBeenCalledWith({ id: 'file-lama' }, 'DasarHukumPPID');
    expect(orderOf(removeStoredFile)).toBeGreaterThan(orderOf(dasarHukum.update));
  });

  it('menyimpan ulang dengan berkas yang sama tidak menghapus apa pun', async () => {
    fileStorage.findUnique.mockResolvedValue({ id: FILE.id });
    dasarHukum.findUnique.mockResolvedValue({ fileId: FILE.id });
    await send('POST', '/dasarhukumppid/update', { ...FORM_HUKUM, fileId: FILE.id });
    expect(removeStoredFile).not.toHaveBeenCalled();
  });

  it('menolak fileId bukan string (kontrak body)', async () => {
    const res = await send('POST', '/dasarhukumppid/update', { ...FORM_HUKUM, fileId: 123 });
    expect(res.status).toBe(422);
    expect(dasarHukum.update).not.toHaveBeenCalled();
  });
});

describe('GET /dasarhukumppid/find-by-id', () => {
  it('menyertakan file (id, link, realName) bila ada', async () => {
    dasarHukum.findFirst.mockResolvedValue({ ...FORM_HUKUM, fileId: FILE.id, file: FILE });
    const res = await send('GET', '/dasarhukumppid/find-by-id');
    const json = await res.json();
    expect(json.data.file).toEqual(FILE);
    expect(dasarHukum.findFirst).toHaveBeenCalledWith({ include: { file: { select: PPID_FILE_SELECT } } });
  });

  it('data lama tanpa berkas: file null, teks tetap ada', async () => {
    dasarHukum.findFirst.mockResolvedValue({ ...FORM_HUKUM, fileId: null, file: null });
    const json = await (await send('GET', '/dasarhukumppid/find-by-id')).json();
    expect(json.data).toMatchObject({ judul: FORM_HUKUM.judul, file: null });
  });
});

describe('POST /daftarinformasipublik/create', () => {
  it('menyimpan fileId yang valid', async () => {
    fileStorage.findUnique.mockResolvedValue({ id: FILE.id });
    daftar.create.mockResolvedValue({});
    const res = await send('POST', '/daftarinformasipublik/create', { ...FORM_DAFTAR, fileId: FILE.id });
    expect(res.status).toBe(200);
    expect(daftar.create).toHaveBeenCalledWith({
      data: { ...FORM_DAFTAR, tanggal: new Date(FORM_DAFTAR.tanggal), fileId: FILE.id },
    });
  });

  it('menolak fileId yang tidak ada, baris tidak dibuat', async () => {
    fileStorage.findUnique.mockResolvedValue(null);
    const res = await send('POST', '/daftarinformasipublik/create', { ...FORM_DAFTAR, fileId: 'tidak-ada' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_FILE_PPID_TIDAK_ADA });
    expect(daftar.create).not.toHaveBeenCalled();
  });

  it('tanpa fileId: baris dibuat tanpa kolom fileId', async () => {
    daftar.create.mockResolvedValue({});
    await send('POST', '/daftarinformasipublik/create', FORM_DAFTAR);
    const { data } = daftar.create.mock.calls[0][0];
    expect(data).not.toHaveProperty('fileId');
  });
});

describe('PUT /daftarinformasipublik/:id', () => {
  it('mengganti berkas: berkas lama dihapus setelah update', async () => {
    fileStorage.findUnique.mockResolvedValue({ id: FILE.id });
    daftar.findUnique.mockResolvedValue({ id: 'd1', fileId: 'file-lama' });
    daftar.update.mockResolvedValue({ id: 'd1' });
    const res = await send('PUT', '/daftarinformasipublik/d1', { ...FORM_DAFTAR, fileId: FILE.id });
    expect(res.status).toBe(200);
    expect(daftar.update.mock.calls[0][0].data).toMatchObject({ fileId: FILE.id });
    expect(removeStoredFile).toHaveBeenCalledWith({ id: 'file-lama' }, 'DaftarInformasiPublik');
    expect(orderOf(removeStoredFile)).toBeGreaterThan(orderOf(daftar.update));
  });

  it('tanpa fileId: berkas lama dibiarkan', async () => {
    daftar.findUnique.mockResolvedValue({ id: 'd1', fileId: 'file-lama' });
    daftar.update.mockResolvedValue({ id: 'd1' });
    await send('PUT', '/daftarinformasipublik/d1', FORM_DAFTAR);
    expect(daftar.update.mock.calls[0][0].data).not.toHaveProperty('fileId');
    expect(removeStoredFile).not.toHaveBeenCalled();
  });

  it('menolak fileId yang tidak ada tanpa mengubah baris', async () => {
    fileStorage.findUnique.mockResolvedValue(null);
    const res = await send('PUT', '/daftarinformasipublik/d1', { ...FORM_DAFTAR, fileId: 'tidak-ada' });
    expect(res.status).toBe(400);
    expect(daftar.update).not.toHaveBeenCalled();
  });
});

describe('GET daftarinformasipublik (find-many & :id)', () => {
  it('find-many menyertakan file per baris, baris lama tanpa berkas tetap null', async () => {
    daftar.findMany.mockResolvedValue([
      { id: 'a', ...FORM_DAFTAR, fileId: FILE.id, file: FILE },
      { id: 'b', ...FORM_DAFTAR, fileId: null, file: null },
    ]);
    daftar.count.mockResolvedValue(2);
    const json = await (await send('GET', '/daftarinformasipublik/find-many')).json();
    expect(json.data.map((row: { file: unknown }) => row.file)).toEqual([FILE, null]);
    expect(daftar.findMany.mock.calls[0][0].include).toEqual({ file: { select: PPID_FILE_SELECT } });
  });

  it(':id menyertakan file', async () => {
    daftar.findUnique.mockResolvedValue({ id: 'a', ...FORM_DAFTAR, file: FILE });
    const json = await (await send('GET', '/daftarinformasipublik/a')).json();
    expect(json.data.file).toEqual(FILE);
    expect(daftar.findUnique).toHaveBeenCalledWith({ where: { id: 'a' }, include: { file: { select: PPID_FILE_SELECT } } });
  });
});

describe('DELETE /daftarinformasipublik/del/:id', () => {
  it('menghapus berkas baris SETELAH barisnya terhapus', async () => {
    daftar.findUnique.mockResolvedValue({ id: 'a', fileId: FILE.id });
    await send('DELETE', '/daftarinformasipublik/del/a');
    expect(removeStoredFile).toHaveBeenCalledWith({ id: FILE.id }, 'DaftarInformasiPublik');
    expect(orderOf(removeStoredFile)).toBeGreaterThan(orderOf(daftar.delete));
  });

  it('baris tanpa berkas: tidak ada penghapusan berkas', async () => {
    daftar.findUnique.mockResolvedValue({ id: 'a', fileId: null });
    await send('DELETE', '/daftarinformasipublik/del/a');
    expect(daftar.delete).toHaveBeenCalled();
    expect(removeStoredFile).not.toHaveBeenCalled();
  });
});
