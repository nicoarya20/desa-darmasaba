// @vitest-environment node
// Lembaga & Komunitas: API /desa/lembagakomunitas. Modul Elysia diuji lewat app.handle dengan prisma dan guard sesi di-mock:
// GET publik hanya yang aktif + limit dibatasi + filter jenis/q; create/updt/del hanya admin (401/403), validasi input,
// foto harus gambar yang ada, hapus = soft-delete, dan tidak ada kolom bookkeeping di respons.
import Elysia from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthMock, removeStoredFileMock, lembaga, fileStorage, prismaMock } = vi.hoisted(() => {
  const lembaga = {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  const fileStorage = { findUnique: vi.fn() };
  return {
    requireAuthMock: vi.fn(),
    removeStoredFileMock: vi.fn(),
    lembaga,
    fileStorage,
    prismaMock: { lembagaKomunitas: lembaga, fileStorage },
  };
});
vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile', () => ({ default: removeStoredFileMock }));

import LembagaKomunitas from '@/app/api/[[...slugs]]/_lib/desa/lembaga-komunitas';
import { LEMBAGA_KOMUNITAS_SELECT } from '@/app/api/[[...slugs]]/_lib/desa/lembaga-komunitas/find-many';
import {
  PESAN_ADMIN_LEMBAGA_KOMUNITAS,
  PESAN_LEMBAGA_KOMUNITAS_TIDAK_ADA,
} from '@/app/api/[[...slugs]]/_lib/desa/lembaga-komunitas/lembaga-komunitas.guard';
import {
  PESAN_FOTO_LEMBAGA_BUKAN_GAMBAR,
  PESAN_FOTO_LEMBAGA_TIDAK_ADA,
} from '@/app/api/[[...slugs]]/_lib/desa/lembaga-komunitas/lembaga-komunitas.foto';
import { LEMBAGA_KOMUNITAS_MAX_LIMIT, PESAN_LEMBAGA_KOMUNITAS as PESAN } from '@/lib/lembaga-komunitas';

const app = new Elysia({ prefix: '/api/desa' }).use(LembagaKomunitas);
const BASE = 'http://localhost/api/desa/lembagakomunitas';
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

// test-only: data rekaan untuk menguji bentuk dan aturan, bukan lembaga nyata Desa Darmasaba.
const INPUT = { nama: 'PKK Contoh', jenis: 'PKK', ketua: 'Ni Contoh', kontak: '0361-123456', deskripsi: 'Uji', urutan: 2 }; // test-only
const ROW = { id: 'lk-1', ...INPUT, foto: null }; // test-only

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  asRole('2');
});

describe('GET /find-many (publik)', () => {
  it('hanya aktif, tanpa sesi, urut jenis-urutan-nama, select tanpa kolom bookkeeping', async () => {
    lembaga.findMany.mockResolvedValue([ROW]);
    lembaga.count.mockResolvedValue(1);
    const res = await send('GET', '/find-many');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: [ROW], page: 1, limit: 10, total: 1, totalPages: 1 });
    expect(requireAuthMock).not.toHaveBeenCalled();
    const arg = lembaga.findMany.mock.calls[0][0];
    expect(arg.where).toEqual({ isActive: true, deletedAt: null });
    expect(arg.orderBy).toEqual([{ jenis: 'asc' }, { urutan: 'asc' }, { nama: 'asc' }]);
    expect(arg.select).toBe(LEMBAGA_KOMUNITAS_SELECT);
    expect(Object.keys(LEMBAGA_KOMUNITAS_SELECT).sort()).toEqual(['deskripsi', 'foto', 'id', 'jenis', 'ketua', 'kontak', 'nama', 'urutan']);
    expect(LEMBAGA_KOMUNITAS_SELECT.foto.select).toEqual({ id: true, link: true });
  });

  it('paginasi: page/limit dipakai, limit dibatasi, nilai tak valid kembali ke bawaan, totalPages dihitung', async () => {
    lembaga.findMany.mockResolvedValue([]);
    lembaga.count.mockResolvedValue(45);
    const res = await send('GET', '/find-many?page=2&limit=20');
    expect(await res.json()).toMatchObject({ page: 2, limit: 20, total: 45, totalPages: 3 });
    expect(lembaga.findMany.mock.calls[0][0]).toMatchObject({ skip: 20, take: 20 });

    await send('GET', '/find-many?limit=100000');
    expect(lembaga.findMany.mock.calls[1][0].take).toBe(LEMBAGA_KOMUNITAS_MAX_LIMIT);
    await send('GET', '/find-many?page=-3&limit=abc');
    expect(lembaga.findMany.mock.calls[2][0]).toMatchObject({ skip: 0, take: 10 });
  });

  it('filter jenis (tepat, tanpa beda huruf) dan q (nama/jenis/ketua) masuk ke where; kata kunci dipotong 100 karakter', async () => {
    lembaga.findMany.mockResolvedValue([]);
    lembaga.count.mockResolvedValue(0);
    await send('GET', `/find-many?jenis=pkk&q=${'x'.repeat(150)}`);
    const where = lembaga.findMany.mock.calls[0][0].where;
    expect(where.jenis).toEqual({ equals: 'pkk', mode: 'insensitive' });
    expect(where.OR).toEqual([
      { nama: { contains: 'x'.repeat(100), mode: 'insensitive' } },
      { jenis: { contains: 'x'.repeat(100), mode: 'insensitive' } },
      { ketua: { contains: 'x'.repeat(100), mode: 'insensitive' } },
    ]);
    expect(where).toMatchObject({ isActive: true, deletedAt: null });
  });

  it('galat DB → 500 berbentuk { success: false } tanpa membocorkan detail', async () => {
    lembaga.findMany.mockRejectedValue(new Error('koneksi putus'));
    lembaga.count.mockResolvedValue(0);
    const res = await send('GET', '/find-many');
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ success: false, message: 'Gagal mengambil daftar Lembaga & Komunitas' });
  });
});

describe('GET /jenis dan GET /:id (publik)', () => {
  it('/jenis: jenis aktif unik A-Z, ejaan huruf besar-kecil yang sama hanya sekali; tidak tertukar dengan /:id', async () => {
    lembaga.findMany.mockResolvedValue([{ jenis: 'PKK' }, { jenis: 'pkk' }, { jenis: 'STT' }]);
    const res = await send('GET', '/jenis');
    expect(await res.json()).toEqual({ success: true, data: ['PKK', 'STT'] });
    expect(lembaga.findMany.mock.calls[0][0]).toMatchObject({
      where: { isActive: true, deletedAt: null },
      distinct: ['jenis'],
      select: { jenis: true },
    });
    expect(lembaga.findFirst).not.toHaveBeenCalled();
  });

  it('/:id ada → data; tidak ada → 404', async () => {
    lembaga.findFirst.mockResolvedValueOnce(ROW).mockResolvedValueOnce(null);
    expect(await (await send('GET', '/lk-1')).json()).toEqual({ success: true, data: ROW });
    expect(lembaga.findFirst.mock.calls[0][0].where).toEqual({ id: 'lk-1', isActive: true, deletedAt: null });
    const res = await send('GET', '/hilang');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ success: false, message: PESAN_LEMBAGA_KOMUNITAS_TIDAK_ADA });
  });
});

describe('POST /create (admin)', () => {
  it('tanpa sesi → 401, akun non-admin (role 5) → 403, tidak ada tulisan ke DB', async () => {
    noSession(401);
    expect((await send('POST', '/create', INPUT)).status).toBe(401);
    asRole('5');
    const res = await send('POST', '/create', INPUT);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ success: false, message: PESAN_ADMIN_LEMBAGA_KOMUNITAS });
    expect(lembaga.create).not.toHaveBeenCalled();
  });

  it('input sah → tersimpan dengan field ternormalisasi; foto tidak ada → fotoId null', async () => {
    lembaga.create.mockResolvedValue(ROW);
    const res = await send('POST', '/create', { ...INPUT, nama: '  PKK   Contoh ' });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, data: ROW });
    expect(lembaga.create).toHaveBeenCalledWith({ data: { ...INPUT, fotoId: null }, select: LEMBAGA_KOMUNITAS_SELECT });
    expect(fileStorage.findUnique).not.toHaveBeenCalled();
  });

  it.each([
    ['nama kosong', { ...INPUT, nama: '' }, PESAN.wajib('Nama')],
    ['jenis hilang dari body', { nama: 'X' }, null],
    ['kontak bukan telepon/email', { ...INPUT, kontak: 'balai banjar' }, PESAN.kontakTidakValid],
    ['deskripsi berisi tag', { ...INPUT, deskripsi: '<img src=x onerror=alert(1)>' }, PESAN.bukanTeksPolos('Deskripsi')],
    ['urutan negatif', { ...INPUT, urutan: -5 }, PESAN.urutanTidakValid],
  ])('ditolak 400 (%s) dan tidak menulis ke DB', async (_nama, body, message) => {
    const res = await send('POST', '/create', body);
    expect([400, 422]).toContain(res.status);
    if (message) expect(await res.json()).toEqual({ success: false, message });
    expect(lembaga.create).not.toHaveBeenCalled();
  });

  it('fotoId yang tidak ada di FileStorage → 400; berkas bukan gambar → 400; gambar → dipakai', async () => {
    fileStorage.findUnique.mockResolvedValueOnce(null);
    let res = await send('POST', '/create', { ...INPUT, fotoId: 'x' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_FOTO_LEMBAGA_TIDAK_ADA });

    fileStorage.findUnique.mockResolvedValueOnce({ id: 'pdf-1', category: 'document' });
    res = await send('POST', '/create', { ...INPUT, fotoId: 'pdf-1' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_FOTO_LEMBAGA_BUKAN_GAMBAR });
    expect(lembaga.create).not.toHaveBeenCalled();

    fileStorage.findUnique.mockResolvedValueOnce({ id: 'img-1', category: 'image' });
    lembaga.create.mockResolvedValue({ ...ROW, foto: { id: 'img-1', link: '/api/img/a.webp' } });
    res = await send('POST', '/create', { ...INPUT, fotoId: 'img-1' });
    expect(res.status).toBe(200);
    expect(lembaga.create.mock.calls[0][0].data.fotoId).toBe('img-1');
  });

  it('galat DB dilempar ulang dengan konteks (bukan ditelan)', async () => {
    lembaga.create.mockRejectedValue(new Error('disk penuh'));
    const res = await send('POST', '/create', INPUT);
    expect(res.status).toBe(500);
    expect(await res.text()).toContain('PKK Contoh');
  });
});

describe('PUT /updt/:id (admin)', () => {
  it('non-admin → 403; id tidak ada → 404', async () => {
    asRole('5');
    expect((await send('PUT', '/updt/lk-1', INPUT)).status).toBe(403);
    asRole('2');
    lembaga.findFirst.mockResolvedValue(null);
    const res = await send('PUT', '/updt/hilang', INPUT);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ success: false, message: PESAN_LEMBAGA_KOMUNITAS_TIDAK_ADA });
    expect(lembaga.update).not.toHaveBeenCalled();
  });

  it('fotoId tidak dikirim → foto tetap (kolom fotoId tidak ikut update), berkas lama tidak dihapus', async () => {
    lembaga.findFirst.mockResolvedValue({ id: 'lk-1', fotoId: 'img-lama' });
    lembaga.update.mockResolvedValue(ROW);
    const res = await send('PUT', '/updt/lk-1', INPUT);
    expect(res.status).toBe(200);
    expect(lembaga.update).toHaveBeenCalledWith({ where: { id: 'lk-1' }, data: INPUT, select: LEMBAGA_KOMUNITAS_SELECT });
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it('foto diganti → berkas lama dihapus SESUDAH update; foto sama → tidak dihapus', async () => {
    lembaga.findFirst.mockResolvedValue({ id: 'lk-1', fotoId: 'img-lama' });
    fileStorage.findUnique.mockResolvedValue({ id: 'img-baru', category: 'image' });
    lembaga.update.mockResolvedValue(ROW);
    await send('PUT', '/updt/lk-1', { ...INPUT, fotoId: 'img-baru' });
    expect(lembaga.update.mock.calls[0][0].data.fotoId).toBe('img-baru');
    expect(removeStoredFileMock).toHaveBeenCalledWith({ id: 'img-lama' }, 'LembagaKomunitas');
    expect(lembaga.update.mock.invocationCallOrder[0]).toBeLessThan(removeStoredFileMock.mock.invocationCallOrder[0]);

    removeStoredFileMock.mockClear();
    fileStorage.findUnique.mockResolvedValue({ id: 'img-lama', category: 'image' });
    await send('PUT', '/updt/lk-1', { ...INPUT, fotoId: 'img-lama' });
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it('fotoId null → foto dilepas dan berkas lama dihapus', async () => {
    lembaga.findFirst.mockResolvedValue({ id: 'lk-1', fotoId: 'img-lama' });
    lembaga.update.mockResolvedValue(ROW);
    await send('PUT', '/updt/lk-1', { ...INPUT, fotoId: null });
    expect(lembaga.update.mock.calls[0][0].data.fotoId).toBeNull();
    expect(removeStoredFileMock).toHaveBeenCalledWith({ id: 'img-lama' }, 'LembagaKomunitas');
  });

  it('input tidak valid → 400 sebelum menyentuh DB; update gagal → berkas lama tidak dihapus', async () => {
    let res = await send('PUT', '/updt/lk-1', { ...INPUT, kontak: 'bukan kontak' });
    expect(res.status).toBe(400);
    expect(lembaga.findFirst).not.toHaveBeenCalled();

    lembaga.findFirst.mockResolvedValue({ id: 'lk-1', fotoId: 'img-lama' });
    fileStorage.findUnique.mockResolvedValue({ id: 'img-baru', category: 'image' });
    lembaga.update.mockRejectedValue(new Error('timeout'));
    res = await send('PUT', '/updt/lk-1', { ...INPUT, fotoId: 'img-baru' });
    expect(res.status).toBe(500);
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });
});

describe('DELETE /del/:id (admin)', () => {
  it('non-admin → 403 dan tidak menulis ke DB', async () => {
    asRole('5');
    expect((await send('DELETE', '/del/lk-1')).status).toBe(403);
    expect(lembaga.update).not.toHaveBeenCalled();
  });

  it('id tidak ada atau sudah dihapus → 404', async () => {
    lembaga.findFirst.mockResolvedValue(null);
    const res = await send('DELETE', '/del/hilang');
    expect(res.status).toBe(404);
    expect(lembaga.findFirst.mock.calls[0][0].where).toEqual({ id: 'hilang', isActive: true, deletedAt: null });
  });

  it('soft-delete: isActive false + deletedAt terisi, baris tidak dihapus, foto tidak dihapus', async () => {
    lembaga.findFirst.mockResolvedValue({ id: 'lk-1' });
    lembaga.update.mockResolvedValue({});
    const res = await send('DELETE', '/del/lk-1');
    expect(res.status).toBe(200);
    const arg = lembaga.update.mock.calls[0][0];
    expect(arg.where).toEqual({ id: 'lk-1' });
    expect(arg.data.isActive).toBe(false);
    expect(arg.data.deletedAt).toBeInstanceOf(Date);
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });
});
