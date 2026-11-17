// @vitest-environment node
// Lomba 2.5: profil lembaga PPID (model baru ProfilLembagaPPID). GET publik, PUT khusus admin dengan sanitasi
// teks kaya di server, pola singleton (perbarui baris aktif atau buat bila belum ada), dan penggantian gambar alur.
// Modul Elysia diuji lewat Request; prisma, auth, dan penghapus berkas di-mock.
import Elysia from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthMock, profil, fileStorage, removeStoredFile } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  profil: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  fileStorage: { findUnique: vi.fn() },
  removeStoredFile: vi.fn(),
}));
vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/prisma', () => ({ default: { profilLembagaPPID: profil, fileStorage } }));
vi.mock('@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile', () => ({ default: removeStoredFile }));

import { PESAN_FILE_PPID_TIDAK_ADA, PPID_FILE_SELECT } from '@/app/api/[[...slugs]]/_lib/ppid/ppid-file';
import ProfilLembagaPPID from '@/app/api/[[...slugs]]/_lib/ppid/profil_lembaga';
import {
  cleanProfilLembagaText,
  PESAN_PROFIL_LEMBAGA_BUKAN_ADMIN,
  PROFIL_LEMBAGA_MAX_TEXT,
} from '@/app/api/[[...slugs]]/_lib/ppid/profil_lembaga/profil-lembaga.shape';

const app = new Elysia({ prefix: '/api/ppid' }).use(ProfilLembagaPPID);
const BASE = 'http://localhost/api/ppid/profillembagappid';
const put = (body: unknown) =>
  app.handle(new Request(`${BASE}/update`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
const asRole = (roleId: string) => ({ authenticated: true, user: { id: 'u-rekaan', roleId, isActive: true } }); // test-only
const orderOf = (fn: ReturnType<typeof vi.fn>) => fn.mock.invocationCallOrder[0];

// test-only: gambar alur & baris rekaan.
const GAMBAR = { id: 'img-baru', link: '/api/img/alur.png', realName: 'alur.png' };
const ROW = { id: 'pl-1', deskripsi: '<p>Deskripsi</p>', tujuan: null, tugasFungsi: null, gambarAlurId: null, gambarAlur: null };

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  requireAuthMock.mockResolvedValue(asRole('2'));
});

describe('cleanProfilLembagaText (sanitasi server)', () => {
  it('membuang script, atribut berbahaya, dan tag di luar allowlist, teks aman dipertahankan', () => {
    const kotor =
      '<p onclick="x()">Halo <strong>dunia</strong></p><script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">klik</a><h2>Judul</h2>';
    const bersih = cleanProfilLembagaText(kotor) as string;
    expect(bersih).toBe('<p>Halo <strong>dunia</strong></p>klikJudul');
    expect(bersih).not.toMatch(/script|onerror|onclick|javascript|alert/i);
  });

  it('HTML tanpa isi teks menjadi null; undefined dan null dibiarkan', () => {
    expect(cleanProfilLembagaText('<p></p>')).toBeNull();
    expect(cleanProfilLembagaText('<p> <br> </p>')).toBeNull();
    expect(cleanProfilLembagaText(undefined)).toBeUndefined();
    expect(cleanProfilLembagaText(null)).toBeNull();
  });
});

describe('GET /find (publik)', () => {
  it('mengembalikan baris aktif beserta gambar alur tanpa perlu login', async () => {
    profil.findFirst.mockResolvedValue({ ...ROW, gambarAlurId: GAMBAR.id, gambarAlur: GAMBAR });
    const res = await app.handle(new Request(`${BASE}/find`));
    expect(res.status).toBe(200);
    expect((await res.json()).data.gambarAlur).toEqual(GAMBAR);
    expect(requireAuthMock).not.toHaveBeenCalled();
    expect(profil.findFirst).toHaveBeenCalledWith({
      where: { isActive: true, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { gambarAlur: { select: PPID_FILE_SELECT } },
    });
  });

  it('belum diisi admin: success true dengan data null', async () => {
    profil.findFirst.mockResolvedValue(null);
    const json = await (await app.handle(new Request(`${BASE}/find`))).json();
    expect(json).toEqual({ success: true, data: null });
  });

  it('galat database: 500 dengan pesan umum (tanpa membocorkan detail)', async () => {
    profil.findFirst.mockRejectedValue(new Error('koneksi putus'));
    const res = await app.handle(new Request(`${BASE}/find`));
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain('koneksi putus');
  });
});

describe('PUT /update (admin)', () => {
  it('tanpa sesi: 401, tidak menulis', async () => {
    requireAuthMock.mockResolvedValue({
      authenticated: false,
      response: Response.json({ message: 'Unauthorized' }, { status: 401 }),
    });
    const res = await put({ deskripsi: '<p>x</p>' });
    expect(res.status).toBe(401);
    expect(profil.create).not.toHaveBeenCalled();
  });

  it('user Google (role 5) ditolak 403 dan tidak menulis', async () => {
    requireAuthMock.mockResolvedValue(asRole('5'));
    const res = await put({ deskripsi: '<p>x</p>' });
    expect(res.status).toBe(403);
    expect((await res.json()).message).toBe(PESAN_PROFIL_LEMBAGA_BUKAN_ADMIN);
    expect(profil.create).not.toHaveBeenCalled();
    expect(profil.update).not.toHaveBeenCalled();
  });

  it('belum ada baris: membuat baris baru dengan teks tersanitasi', async () => {
    profil.findFirst.mockResolvedValue(null);
    profil.create.mockResolvedValue(ROW);
    const res = await put({
      deskripsi: '<p>Profil</p><script>alert(1)</script>',
      tujuan: '<p></p>',
      tugasFungsi: '<ul><li onclick="x()">Melayani</li></ul>',
    });
    expect(res.status).toBe(200);
    expect(profil.create).toHaveBeenCalledWith({
      data: { deskripsi: '<p>Profil</p>', tujuan: null, tugasFungsi: '<ul><li>Melayani</li></ul>' },
      include: { gambarAlur: { select: PPID_FILE_SELECT } },
    });
    expect(profil.update).not.toHaveBeenCalled();
  });

  it('sudah ada baris: memperbarui baris itu, hanya bagian yang dikirim', async () => {
    profil.findFirst.mockResolvedValue({ ...ROW });
    profil.update.mockResolvedValue(ROW);
    await put({ tujuan: '<p>Tujuan baru</p>' });
    expect(profil.update).toHaveBeenCalledWith({
      where: { id: 'pl-1' },
      data: { tujuan: '<p>Tujuan baru</p>' },
      include: { gambarAlur: { select: PPID_FILE_SELECT } },
    });
    expect(profil.create).not.toHaveBeenCalled();
  });

  it('menolak gambarAlurId yang tidak ada di FileStorage', async () => {
    fileStorage.findUnique.mockResolvedValue(null);
    const res = await put({ gambarAlurId: 'tidak-ada' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: PESAN_FILE_PPID_TIDAK_ADA });
    expect(profil.update).not.toHaveBeenCalled();
    expect(profil.create).not.toHaveBeenCalled();
  });

  it('mengganti gambar alur: gambar lama dihapus setelah relasi dipindah', async () => {
    fileStorage.findUnique.mockResolvedValue({ id: GAMBAR.id });
    profil.findFirst.mockResolvedValue({ ...ROW, gambarAlurId: 'img-lama' });
    profil.update.mockResolvedValue({ ...ROW, gambarAlurId: GAMBAR.id, gambarAlur: GAMBAR });
    await put({ gambarAlurId: GAMBAR.id });
    expect(removeStoredFile).toHaveBeenCalledWith({ id: 'img-lama' }, 'ProfilLembagaPPID');
    expect(orderOf(removeStoredFile)).toBeGreaterThan(orderOf(profil.update));
  });

  it('gambarAlurId null melepas gambar dan menghapus berkas lamanya', async () => {
    profil.findFirst.mockResolvedValue({ ...ROW, gambarAlurId: 'img-lama' });
    profil.update.mockResolvedValue(ROW);
    await put({ gambarAlurId: null });
    expect(profil.update.mock.calls[0][0].data).toEqual({ gambarAlurId: null });
    expect(removeStoredFile).toHaveBeenCalledWith({ id: 'img-lama' }, 'ProfilLembagaPPID');
  });

  it('gambar yang sama atau tidak dikirim: tidak ada berkas dihapus', async () => {
    fileStorage.findUnique.mockResolvedValue({ id: 'img-lama' });
    profil.findFirst.mockResolvedValue({ ...ROW, gambarAlurId: 'img-lama' });
    profil.update.mockResolvedValue({ ...ROW, gambarAlurId: 'img-lama' });
    await put({ gambarAlurId: 'img-lama' });
    await put({ deskripsi: '<p>x</p>' });
    expect(removeStoredFile).not.toHaveBeenCalled();
  });

  it('menolak teks melebihi batas panjang (422)', async () => {
    const res = await put({ deskripsi: 'a'.repeat(PROFIL_LEMBAGA_MAX_TEXT + 1) });
    expect(res.status).toBe(422);
    expect(profil.create).not.toHaveBeenCalled();
  });

  it('galat database: 500 berpesan umum dan galat dicatat dengan konteks', async () => {
    profil.findFirst.mockRejectedValue(new Error('koneksi putus'));
    const res = await put({ deskripsi: '<p>x</p>' });
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain('koneksi putus');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('profilLembagaPPIDUpdate'), expect.any(Error));
  });
});
