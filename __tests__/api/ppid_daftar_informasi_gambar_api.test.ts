// @vitest-environment node
// Daftar Informasi Publik: gambar pendukung opsional (`gambarId`). Handler diuji lewat modul Elysia dengan prisma &
// penghapus berkas di-mock: baris tanpa gambar tetap valid, `gambarId` tak dikenal ditolak (400), gambar lama dihapus
// SETELAH relasi dipindah/dilepas, `gambarId: null` melepas gambar, dan respons membawa `gambar`.
import Elysia from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { fileStorage, daftar, removeStoredFile } = vi.hoisted(() => ({
  fileStorage: { findUnique: vi.fn() },
  daftar: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn(), delete: vi.fn() },
  removeStoredFile: vi.fn(),
}));
vi.mock('@/lib/prisma', () => ({ default: { fileStorage, daftarInformasiPublik: daftar } }));
vi.mock('@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile', () => ({ default: removeStoredFile }));

import DaftarInformasiPublik from '@/app/api/[[...slugs]]/_lib/ppid/daftar_informasi_publik';
import { PESAN_FILE_PPID_TIDAK_ADA } from '@/app/api/[[...slugs]]/_lib/ppid/ppid-file';

const app = new Elysia({ prefix: '/api/ppid' }).use(DaftarInformasiPublik);
const send = (method: string, path: string, body?: unknown) =>
  app.handle(
    new Request(`http://localhost/api/ppid${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );

// test-only: gambar dan baris rekaan.
const GAMBAR = { id: 'gambar-baru', link: '/api/fileStorage/findUnique/foto.webp', realName: 'foto.webp' };
const FORM = { jenisInformasi: 'Profil Desa', deskripsi: '<p>Profil</p>', tanggal: '2026-11-01' };
const orderOf = (fn: ReturnType<typeof vi.fn>) => fn.mock.invocationCallOrder[0];

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('POST /daftarinformasipublik/create', () => {
  it('menyimpan gambarId yang valid', async () => {
    fileStorage.findUnique.mockResolvedValue({ id: GAMBAR.id });
    daftar.create.mockResolvedValue({});
    const res = await send('POST', '/daftarinformasipublik/create', { ...FORM, gambarId: GAMBAR.id });
    expect(res.status).toBe(200);
    expect(daftar.create.mock.calls[0][0].data).toMatchObject({ gambarId: GAMBAR.id });
  });

  it('tanpa gambarId (gambar opsional): baris dibuat tanpa kolom gambarId dan tanpa cek berkas', async () => {
    daftar.create.mockResolvedValue({});
    const res = await send('POST', '/daftarinformasipublik/create', FORM);
    expect(res.status).toBe(200);
    expect(daftar.create.mock.calls[0][0].data).not.toHaveProperty('gambarId');
    expect(fileStorage.findUnique).not.toHaveBeenCalled();
  });

  it('gambarId null dianggap tanpa gambar', async () => {
    daftar.create.mockResolvedValue({});
    const res = await send('POST', '/daftarinformasipublik/create', { ...FORM, gambarId: null });
    expect(res.status).toBe(200);
    expect(daftar.create.mock.calls[0][0].data).not.toHaveProperty('gambarId');
  });

  it('menolak gambarId yang tidak ada di FileStorage, baris tidak dibuat', async () => {
    fileStorage.findUnique.mockResolvedValue(null);
    const res = await send('POST', '/daftarinformasipublik/create', { ...FORM, gambarId: 'tidak-ada' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_FILE_PPID_TIDAK_ADA });
    expect(daftar.create).not.toHaveBeenCalled();
  });
});

describe('PUT /daftarinformasipublik/:id', () => {
  it('mengganti gambar: gambar lama dihapus setelah update', async () => {
    fileStorage.findUnique.mockResolvedValue({ id: GAMBAR.id });
    daftar.findUnique.mockResolvedValue({ id: 'd1', fileId: null, gambarId: 'gambar-lama' });
    daftar.update.mockResolvedValue({ id: 'd1' });
    const res = await send('PUT', '/daftarinformasipublik/d1', { ...FORM, gambarId: GAMBAR.id });
    expect(res.status).toBe(200);
    expect(daftar.update.mock.calls[0][0].data).toMatchObject({ gambarId: GAMBAR.id });
    expect(removeStoredFile).toHaveBeenCalledWith({ id: 'gambar-lama' }, 'DaftarInformasiPublik');
    expect(orderOf(removeStoredFile)).toBeGreaterThan(orderOf(daftar.update));
  });

  it('gambarId null: gambar dilepas lalu berkas lamanya dihapus', async () => {
    daftar.findUnique.mockResolvedValue({ id: 'd1', fileId: null, gambarId: 'gambar-lama' });
    daftar.update.mockResolvedValue({ id: 'd1' });
    const res = await send('PUT', '/daftarinformasipublik/d1', { ...FORM, gambarId: null });
    expect(res.status).toBe(200);
    expect(daftar.update.mock.calls[0][0].data).toHaveProperty('gambarId', null);
    expect(fileStorage.findUnique).not.toHaveBeenCalled();
    expect(removeStoredFile).toHaveBeenCalledWith({ id: 'gambar-lama' }, 'DaftarInformasiPublik');
    expect(orderOf(removeStoredFile)).toBeGreaterThan(orderOf(daftar.update));
  });

  it('gambarId null pada baris yang memang tanpa gambar: tidak ada penghapusan berkas', async () => {
    daftar.findUnique.mockResolvedValue({ id: 'd1', fileId: null, gambarId: null });
    daftar.update.mockResolvedValue({ id: 'd1' });
    await send('PUT', '/daftarinformasipublik/d1', { ...FORM, gambarId: null });
    expect(removeStoredFile).not.toHaveBeenCalled();
  });

  it('tanpa gambarId: gambar lama dibiarkan', async () => {
    daftar.findUnique.mockResolvedValue({ id: 'd1', fileId: null, gambarId: 'gambar-lama' });
    daftar.update.mockResolvedValue({ id: 'd1' });
    await send('PUT', '/daftarinformasipublik/d1', FORM);
    expect(daftar.update.mock.calls[0][0].data).not.toHaveProperty('gambarId');
    expect(removeStoredFile).not.toHaveBeenCalled();
  });

  it('gambarId sama dengan yang tersimpan: tidak dihapus', async () => {
    fileStorage.findUnique.mockResolvedValue({ id: 'gambar-lama' });
    daftar.findUnique.mockResolvedValue({ id: 'd1', fileId: null, gambarId: 'gambar-lama' });
    daftar.update.mockResolvedValue({ id: 'd1' });
    await send('PUT', '/daftarinformasipublik/d1', { ...FORM, gambarId: 'gambar-lama' });
    expect(removeStoredFile).not.toHaveBeenCalled();
  });

  it('menolak gambarId yang tidak ada tanpa mengubah baris', async () => {
    fileStorage.findUnique.mockResolvedValue(null);
    const res = await send('PUT', '/daftarinformasipublik/d1', { ...FORM, gambarId: 'tidak-ada' });
    expect(res.status).toBe(400);
    expect(daftar.update).not.toHaveBeenCalled();
  });

  it('respons update membawa file dan gambar', async () => {
    daftar.findUnique.mockResolvedValue({ id: 'd1', fileId: null, gambarId: null });
    daftar.update.mockResolvedValue({ id: 'd1', file: null, gambar: GAMBAR });
    const json = await (await send('PUT', '/daftarinformasipublik/d1', FORM)).json();
    expect(json.data.gambar).toEqual(GAMBAR);
    expect(daftar.update.mock.calls[0][0].include).toHaveProperty('gambar');
  });
});

describe('GET daftarinformasipublik (find-many & :id)', () => {
  it('find-many menyertakan gambar per baris; baris tanpa gambar tetap null', async () => {
    daftar.findMany.mockResolvedValue([
      { id: 'a', ...FORM, gambarId: GAMBAR.id, gambar: GAMBAR },
      { id: 'b', ...FORM, gambarId: null, gambar: null },
    ]);
    daftar.count.mockResolvedValue(2);
    const json = await (await send('GET', '/daftarinformasipublik/find-many')).json();
    expect(json.data.map((row: { gambar: unknown }) => row.gambar)).toEqual([GAMBAR, null]);
    expect(daftar.findMany.mock.calls[0][0].include).toHaveProperty('gambar');
  });

  it(':id menyertakan gambar', async () => {
    daftar.findUnique.mockResolvedValue({ id: 'a', ...FORM, gambar: GAMBAR });
    const json = await (await send('GET', '/daftarinformasipublik/a')).json();
    expect(json.data.gambar).toEqual(GAMBAR);
  });

  it(':id baris tanpa gambar: gambar null', async () => {
    daftar.findUnique.mockResolvedValue({ id: 'a', ...FORM, gambar: null });
    const json = await (await send('GET', '/daftarinformasipublik/a')).json();
    expect(json.data.gambar).toBeNull();
  });
});

describe('DELETE /daftarinformasipublik/del/:id', () => {
  it('menghapus gambar baris SETELAH barisnya terhapus', async () => {
    daftar.findUnique.mockResolvedValue({ id: 'a', fileId: null, gambarId: GAMBAR.id });
    await send('DELETE', '/daftarinformasipublik/del/a');
    expect(removeStoredFile).toHaveBeenCalledWith({ id: GAMBAR.id }, 'DaftarInformasiPublik');
    expect(orderOf(removeStoredFile)).toBeGreaterThan(orderOf(daftar.delete));
  });

  it('baris dengan PDF dan gambar: keduanya dihapus', async () => {
    daftar.findUnique.mockResolvedValue({ id: 'a', fileId: 'pdf-1', gambarId: GAMBAR.id });
    await send('DELETE', '/daftarinformasipublik/del/a');
    expect(removeStoredFile).toHaveBeenCalledWith({ id: 'pdf-1' }, 'DaftarInformasiPublik');
    expect(removeStoredFile).toHaveBeenCalledWith({ id: GAMBAR.id }, 'DaftarInformasiPublik');
  });

  it('baris tanpa gambar: tidak ada penghapusan berkas', async () => {
    daftar.findUnique.mockResolvedValue({ id: 'a', fileId: null, gambarId: null });
    await send('DELETE', '/daftarinformasipublik/del/a');
    expect(daftar.delete).toHaveBeenCalled();
    expect(removeStoredFile).not.toHaveBeenCalled();
  });
});
