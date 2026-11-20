// @vitest-environment node
// Tim Pengelola Website: API /desa/timpengelola. Modul Elysia diuji lewat app.handle dengan prisma, guard sesi, dan
// penghapus berkas di-mock: GET publik tanpa sesi dan TANPA anggota, GET /admin dan PUT hanya admin (401/403), validasi di
// batas API (400), berkas SK harus PDF aktif, anggota diganti utuh dalam satu transaksi, dan galat database tidak membocorkan detail.
import { readFileSync } from 'node:fs';
import Elysia from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthMock, removeStoredFileMock, tim, anggota, fileStorage, prismaMock } = vi.hoisted(() => {
  const tim = { findUnique: vi.fn(), upsert: vi.fn(), findUniqueOrThrow: vi.fn() };
  const anggota = { deleteMany: vi.fn(), createMany: vi.fn() };
  const fileStorage = { findUnique: vi.fn() };
  const prismaMock = {
    timPengelolaWebsite: tim,
    anggotaTimPengelola: anggota,
    fileStorage,
    $transaction: vi.fn(),
  };
  return { requireAuthMock: vi.fn(), removeStoredFileMock: vi.fn(), tim, anggota, fileStorage, prismaMock };
});
vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile', () => ({ default: removeStoredFileMock }));

import TimPengelola from '@/app/api/[[...slugs]]/_lib/desa/tim-pengelola';
import { TIM_PENGELOLA_ADMIN_SELECT } from '@/app/api/[[...slugs]]/_lib/desa/tim-pengelola/find-admin';
import { TIM_PENGELOLA_PUBLIC_SELECT } from '@/app/api/[[...slugs]]/_lib/desa/tim-pengelola/find';
import {
  PESAN_ADMIN_TIM_PENGELOLA,
  PESAN_GAGAL_BACA_TIM_PENGELOLA,
  PESAN_GAGAL_SIMPAN_TIM_PENGELOLA,
} from '@/app/api/[[...slugs]]/_lib/desa/tim-pengelola/tim-pengelola.guard';
import { TIM_PENGELOLA_ID } from '@/lib/tim-pengelola';

const app = new Elysia({ prefix: '/api/desa' }).use(TimPengelola);
const URL_TIM = 'http://localhost/api/desa/timpengelola';
const send = (method: string, path = '', body?: unknown) =>
  app.handle(
    new Request(`${URL_TIM}${path}`, {
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

// test-only: baris dan isian rekaan (nama fiktif, bukan isi SK sebenarnya).
const FILE = { id: 'file-baru', link: '/api/img/sk-uji.pdf', realName: 'sk-uji.pdf' };
const PUBLIC_ROW = { id: TIM_PENGELOLA_ID, nomorSk: '99 Tahun 2026', tanggalSk: new Date('2026-01-12T00:00:00.000Z'), skFile: FILE, updatedAt: new Date('2026-11-20T00:00:00.000Z') };
const ANGGOTA = [
  { nama: 'Anggota Uji Satu', jabatan: 'Ketua' },
  { nama: 'Anggota Uji Dua', jabatan: 'Sekretaris' },
];
const ADMIN_ROW = { ...PUBLIC_ROW, anggota: ANGGOTA };
const BODY = { nomorSk: '99 Tahun 2026', tanggalSk: '2026-01-12', anggota: ANGGOTA };
const ISO_PUBLIC = { ...PUBLIC_ROW, tanggalSk: '2026-01-12T00:00:00.000Z', updatedAt: '2026-11-20T00:00:00.000Z' };

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  asRole('2');
  prismaMock.$transaction.mockImplementation((fn: (tx: typeof prismaMock) => unknown) => fn(prismaMock));
  tim.findUnique.mockResolvedValue({ skFileId: null });
  tim.upsert.mockResolvedValue({ id: TIM_PENGELOLA_ID });
  tim.findUniqueOrThrow.mockResolvedValue(ADMIN_ROW);
  fileStorage.findUnique.mockResolvedValue({ mimeType: 'application/pdf', isActive: true });
});

describe('GET /desa/timpengelola (publik)', () => {
  it('mengembalikan nomor SK + tautan PDF tanpa memeriksa sesi, TANPA anggota', async () => {
    tim.findUnique.mockResolvedValue(PUBLIC_ROW);
    const res = await send('GET');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, message: 'Data ditemukan', data: ISO_PUBLIC });
    expect(requireAuthMock).not.toHaveBeenCalled();
    expect(tim.findUnique).toHaveBeenCalledWith({ where: { id: TIM_PENGELOLA_ID }, select: TIM_PENGELOLA_PUBLIC_SELECT });
    expect(Object.keys(TIM_PENGELOLA_PUBLIC_SELECT)).toEqual(['id', 'nomorSk', 'tanggalSk', 'skFile', 'updatedAt']);
    expect(Object.keys(TIM_PENGELOLA_PUBLIC_SELECT)).not.toContain('anggota');
  });

  it('berkas SK hanya id/link/realName (tanpa path internal)', () => {
    expect(TIM_PENGELOLA_PUBLIC_SELECT.skFile).toEqual({ select: { id: true, link: true, realName: true } });
  });

  it('belum diisi → 200 dengan data null (bukan 404, agar footer tidak dianggap galat)', async () => {
    tim.findUnique.mockResolvedValue(null);
    const res = await send('GET');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, data: null });
  });

  it('galat database → 500 berpesan umum tanpa detail internal', async () => {
    tim.findUnique.mockRejectedValue(new Error('connection refused 10.0.0.1'));
    const res = await send('GET');
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ success: false, message: PESAN_GAGAL_BACA_TIM_PENGELOLA });
  });
});

describe('GET /desa/timpengelola/admin', () => {
  it.each(['0', '1', '2', '3', '4'])('role %s (admin) mendapat anggota berurutan', async (roleId) => {
    asRole(roleId);
    tim.findUnique.mockResolvedValue(ADMIN_ROW);
    const res = await send('GET', '/admin');
    expect(res.status).toBe(200);
    expect((await res.json()).data.anggota).toEqual(ANGGOTA);
    expect(tim.findUnique).toHaveBeenCalledWith({ where: { id: TIM_PENGELOLA_ID }, select: TIM_PENGELOLA_ADMIN_SELECT });
    expect(TIM_PENGELOLA_ADMIN_SELECT.anggota).toEqual({ select: { nama: true, jabatan: true }, orderBy: { urutan: 'asc' } });
  });

  it('tanpa sesi → 401, akun non-admin (role 5) → 403; anggota tidak dibaca dari database', async () => {
    noSession(401);
    expect((await send('GET', '/admin')).status).toBe(401);
    asRole('5');
    const res = await send('GET', '/admin');
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ success: false, message: PESAN_ADMIN_TIM_PENGELOLA });
    expect(tim.findUnique).not.toHaveBeenCalled();
  });

  it('belum diisi → 200 dengan data null; galat database → 500 berpesan umum', async () => {
    tim.findUnique.mockResolvedValue(null);
    expect(await (await send('GET', '/admin')).json()).toMatchObject({ success: true, data: null });
    tim.findUnique.mockRejectedValue(new Error('deadlock'));
    const res = await send('GET', '/admin');
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ success: false, message: PESAN_GAGAL_BACA_TIM_PENGELOLA });
  });
});

describe('PUT /desa/timpengelola (admin)', () => {
  it.each(['0', '1', '2', '3', '4'])('role %s (admin) boleh menyimpan', async (roleId) => {
    asRole(roleId);
    expect((await send('PUT', '', BODY)).status).toBe(200);
  });

  it('tanpa sesi → 401, akun non-admin (role 5) → 403, database tidak disentuh', async () => {
    noSession(401);
    expect((await send('PUT', '', BODY)).status).toBe(401);
    asRole('5');
    const res = await send('PUT', '', BODY);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ success: false, message: PESAN_ADMIN_TIM_PENGELOLA });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(tim.upsert).not.toHaveBeenCalled();
  });

  it('upsert ke baris singleton (tanggal menjadi Date UTC) dan mengembalikan data admin lengkap dengan anggota', async () => {
    const res = await send('PUT', '', { ...BODY, nomorSk: '  99   Tahun 2026 ' });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ success: true, message: 'Tim pengelola website berhasil disimpan' });
    expect(json.data.anggota).toEqual(ANGGOTA);
    const fields = { nomorSk: '99 Tahun 2026', tanggalSk: new Date('2026-01-12T00:00:00.000Z') };
    expect(tim.upsert).toHaveBeenCalledWith({
      where: { id: TIM_PENGELOLA_ID },
      create: { id: TIM_PENGELOLA_ID, ...fields, skFileId: null },
      update: fields,
      select: { id: true },
    });
    expect(tim.findUniqueOrThrow).toHaveBeenCalledWith({ where: { id: TIM_PENGELOLA_ID }, select: TIM_PENGELOLA_ADMIN_SELECT });
  });

  it('tanpa tanggal → tersimpan null', async () => {
    await send('PUT', '', { ...BODY, tanggalSk: '' });
    expect(tim.upsert.mock.calls[0][0].update.tanggalSk).toBeNull();
  });

  it('anggota diganti utuh dalam SATU transaksi: hapus semua lalu isi ulang dengan urutan rapat 0..n-1', async () => {
    const order: string[] = [];
    tim.upsert.mockImplementation(async () => (order.push('upsert'), { id: TIM_PENGELOLA_ID }));
    anggota.deleteMany.mockImplementation(async () => (order.push('deleteMany'), { count: 5 }));
    anggota.createMany.mockImplementation(async () => (order.push('createMany'), { count: 2 }));
    await send('PUT', '', BODY);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(order).toEqual(['upsert', 'deleteMany', 'createMany']);
    expect(anggota.deleteMany).toHaveBeenCalledWith({ where: { timId: TIM_PENGELOLA_ID } });
    expect(anggota.createMany).toHaveBeenCalledWith({
      data: [
        { timId: TIM_PENGELOLA_ID, nama: 'Anggota Uji Satu', jabatan: 'Ketua', urutan: 0 },
        { timId: TIM_PENGELOLA_ID, nama: 'Anggota Uji Dua', jabatan: 'Sekretaris', urutan: 1 },
      ],
    });
  });

  it('daftar anggota kosong → anggota lama dihapus dan tidak ada createMany', async () => {
    await send('PUT', '', { ...BODY, anggota: [] });
    expect(anggota.deleteMany).toHaveBeenCalledTimes(1);
    expect(anggota.createMany).not.toHaveBeenCalled();
  });

  it('galat di tengah transaksi → 500 berpesan umum, tidak ada penghapusan berkas lama', async () => {
    tim.findUnique.mockResolvedValue({ skFileId: 'file-lama' });
    anggota.createMany.mockRejectedValue(new Error('unique violation in AnggotaTimPengelola'));
    const res = await send('PUT', '', { ...BODY, skFileId: 'file-baru' });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ success: false, message: PESAN_GAGAL_SIMPAN_TIM_PENGELOLA });
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it.each([
    ['nomor SK kosong', { nomorSk: '  ' }, 'Nomor SK wajib diisi'],
    ['nomor SK terlalu panjang', { nomorSk: 'x'.repeat(101) }, 'Nomor SK maksimal 100 karakter'],
    ['tanggal mustahil', { tanggalSk: '2026-02-30' }, /^Tanggal SK tidak valid/],
    ['anggota tanpa nama', { anggota: [{ nama: '', jabatan: 'Ketua' }] }, 'Anggota ke-1: Nama wajib diisi'],
    ['anggota tanpa jabatan', { anggota: [ANGGOTA[0], { nama: 'Anggota Uji', jabatan: ' ' }] }, 'Anggota ke-2: Jabatan wajib diisi'],
    ['anggota melebihi batas', { anggota: Array.from({ length: 31 }, () => ANGGOTA[0]) }, 'Anggota maksimal 30 orang'],
    ['anggota bukan daftar', { anggota: 'Ketua' }, 'Daftar anggota harus berupa daftar'],
  ])('400 bila %s, database tidak disentuh', async (_label, patch, message) => {
    const res = await send('PUT', '', { ...BODY, ...patch });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(message instanceof RegExp ? message : new RegExp(`^${message}$`));
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('daftar anggota tidak dikirim → 400 (bukan menghapus anggota yang tersimpan)', async () => {
    const res = await send('PUT', '', { nomorSk: BODY.nomorSk });
    expect(res.status).toBe(400);
    expect((await res.json()).message).toBe('Daftar anggota wajib dikirim (boleh kosong)');
    expect(anggota.deleteMany).not.toHaveBeenCalled();
  });

  it('kunci di luar field yang dikenal (id, createdAt) tidak diteruskan ke database', async () => {
    await send('PUT', '', { ...BODY, id: 'lain', createdAt: '2000-01-01' });
    const arg = tim.upsert.mock.calls[0][0];
    expect(Object.keys(arg.create).sort()).toEqual(['id', 'nomorSk', 'skFileId', 'tanggalSk']);
    expect(arg.create.id).toBe(TIM_PENGELOLA_ID);
    expect(Object.keys(arg.update).sort()).toEqual(['nomorSk', 'tanggalSk']);
  });
});

describe('PUT /desa/timpengelola: berkas SK', () => {
  it('berkas tidak dikirim → skFileId tidak diubah dan tidak ada penghapusan berkas', async () => {
    tim.findUnique.mockResolvedValue({ skFileId: 'file-lama' });
    await send('PUT', '', BODY);
    expect('skFileId' in tim.upsert.mock.calls[0][0].update).toBe(false);
    expect(fileStorage.findUnique).not.toHaveBeenCalled();
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it('PDF aktif baru → tersimpan, PDF lama dihapus permanen SESUDAH transaksi', async () => {
    tim.findUnique.mockResolvedValue({ skFileId: 'file-lama' });
    const res = await send('PUT', '', { ...BODY, skFileId: 'file-baru' });
    expect(res.status).toBe(200);
    expect(fileStorage.findUnique).toHaveBeenCalledWith({ where: { id: 'file-baru' }, select: { mimeType: true, isActive: true } });
    const arg = tim.upsert.mock.calls[0][0];
    expect(arg.update.skFileId).toBe('file-baru');
    expect(arg.create.skFileId).toBe('file-baru');
    expect(removeStoredFileMock).toHaveBeenCalledWith({ id: 'file-lama' }, 'TimPengelolaWebsite');
  });

  it('berkas yang sama dikirim ulang → tidak dihapus', async () => {
    tim.findUnique.mockResolvedValue({ skFileId: 'file-baru' });
    await send('PUT', '', { ...BODY, skFileId: 'file-baru' });
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it('skFileId null → berkas dilepas dan berkas lama dihapus', async () => {
    tim.findUnique.mockResolvedValue({ skFileId: 'file-lama' });
    await send('PUT', '', { ...BODY, skFileId: null });
    expect(tim.upsert.mock.calls[0][0].update.skFileId).toBeNull();
    expect(fileStorage.findUnique).not.toHaveBeenCalled();
    expect(removeStoredFileMock).toHaveBeenCalledWith({ id: 'file-lama' }, 'TimPengelolaWebsite');
  });

  it('baris belum ada + PDF pertama → tidak ada berkas lama yang dihapus', async () => {
    tim.findUnique.mockResolvedValue(null);
    expect((await send('PUT', '', { ...BODY, skFileId: 'file-baru' })).status).toBe(200);
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it.each([
    ['tidak ditemukan', null],
    ['sudah dihapus', { mimeType: 'application/pdf', isActive: false }],
  ])('berkas %s → 400, transaksi tidak berjalan', async (_label, row) => {
    fileStorage.findUnique.mockResolvedValue(row);
    const res = await send('PUT', '', { ...BODY, skFileId: 'file-x' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: 'File tidak ditemukan atau sudah dihapus' });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('berkas bukan PDF → 400', async () => {
    fileStorage.findUnique.mockResolvedValue({ mimeType: 'image/png', isActive: true });
    const res = await send('PUT', '', { ...BODY, skFileId: 'file-gambar' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: 'File dokumen harus berformat PDF' });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});

describe('registrasi', () => {
  it('modul terdaftar di router Desa (/api/desa/timpengelola)', () => {
    const source = readFileSync('src/app/api/[[...slugs]]/_lib/desa/index.ts', 'utf8');
    expect(source).toContain('import TimPengelola from "./tim-pengelola"');
    expect(source).toContain('.use(TimPengelola)');
  });
});
