// @vitest-environment node
// Kontak Desa (Profil Desa): API /desa/kontakdesa. Modul Elysia diuji lewat app.handle dengan prisma dan guard sesi
// di-mock: GET publik tanpa sesi (footer & PPID), PUT hanya admin (401/403), validasi di batas API (400), upsert ke
// baris singleton, dan galat database tidak membocorkan detail.
import { readFileSync } from 'node:fs';
import Elysia from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthMock, kontak, prismaMock } = vi.hoisted(() => {
  const kontak = { findUnique: vi.fn(), upsert: vi.fn() };
  return { requireAuthMock: vi.fn(), kontak, prismaMock: { kontakDesa: kontak } };
});
vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import KontakDesa from '@/app/api/[[...slugs]]/_lib/desa/kontak-desa';
import { KONTAK_DESA_SELECT } from '@/app/api/[[...slugs]]/_lib/desa/kontak-desa/find';
import {
  PESAN_ADMIN_KONTAK_DESA,
  PESAN_GAGAL_BACA_KONTAK_DESA,
  PESAN_GAGAL_SIMPAN_KONTAK_DESA,
} from '@/app/api/[[...slugs]]/_lib/desa/kontak-desa/kontak-desa.guard';
import { KONTAK_DESA_ID } from '@/lib/kontak-desa';

const app = new Elysia({ prefix: '/api/desa' }).use(KontakDesa);
const URL_KONTAK = 'http://localhost/api/desa/kontakdesa';
const send = (method: string, body?: unknown) =>
  app.handle(
    new Request(URL_KONTAK, {
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

// test-only: baris dan isian rekaan.
const ROW = {
  id: KONTAK_DESA_ID,
  namaKantor: 'Kantor Uji',
  alamat: 'Jl. Uji No. 1',
  telepon: '(0361) 8441518',
  email: 'uji@example.com',
  whatsapp: null,
  jamLayanan: null,
  updatedAt: new Date('2026-11-19T00:00:00.000Z'),
};
const BODY = { namaKantor: ROW.namaKantor, alamat: ROW.alamat, telepon: ROW.telepon, email: ROW.email };
// Yang diteruskan ke database: WhatsApp dan jam layanan opsional selalu ada di data hasil validasi (null bila tidak diisi).
const DATA = { ...BODY, whatsapp: null, jamLayanan: null };

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  asRole('2');
});

describe('GET /desa/kontakdesa (publik)', () => {
  it('mengembalikan kontak tanpa memeriksa sesi, hanya kolom kontrak output', async () => {
    kontak.findUnique.mockResolvedValue(ROW);
    const res = await send('GET');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      message: 'Data ditemukan',
      data: { ...ROW, updatedAt: '2026-11-19T00:00:00.000Z' },
    });
    expect(requireAuthMock).not.toHaveBeenCalled();
    expect(kontak.findUnique).toHaveBeenCalledWith({ where: { id: KONTAK_DESA_ID }, select: KONTAK_DESA_SELECT });
    expect(Object.keys(KONTAK_DESA_SELECT)).toEqual(['id', 'namaKantor', 'alamat', 'telepon', 'email', 'whatsapp', 'jamLayanan', 'updatedAt']);
  });

  it('baris belum ada → 200 dengan data null (bukan 404, agar footer tidak dianggap galat)', async () => {
    kontak.findUnique.mockResolvedValue(null);
    const res = await send('GET');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, data: null });
  });

  it('galat database → 500 berpesan umum tanpa detail internal', async () => {
    kontak.findUnique.mockRejectedValue(new Error('connection refused 10.0.0.1'));
    const res = await send('GET');
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ success: false, message: PESAN_GAGAL_BACA_KONTAK_DESA });
  });
});

describe('PUT /desa/kontakdesa (admin)', () => {
  it.each(['0', '1', '2', '3', '4'])('role %s (admin) boleh menyimpan', async (roleId) => {
    asRole(roleId);
    kontak.upsert.mockResolvedValue(ROW);
    expect((await send('PUT', BODY)).status).toBe(200);
  });

  it('upsert ke baris singleton dengan isian yang sudah dirapikan, mengembalikan data tersimpan', async () => {
    kontak.upsert.mockResolvedValue(ROW);
    const res = await send('PUT', { ...BODY, namaKantor: '  Kantor   Uji ', email: ' uji@example.com ' });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, message: 'Kontak desa berhasil disimpan', data: { email: ROW.email } });
    expect(kontak.upsert).toHaveBeenCalledWith({
      where: { id: KONTAK_DESA_ID },
      create: { id: KONTAK_DESA_ID, ...DATA },
      update: DATA,
      select: KONTAK_DESA_SELECT,
    });
  });

  it('kunci di luar field yang dikenal (id, createdAt) tidak diteruskan ke database', async () => {
    kontak.upsert.mockResolvedValue(ROW);
    await send('PUT', { ...BODY, id: 'lain', createdAt: '2000-01-01' });
    const arg = kontak.upsert.mock.calls[0][0];
    expect(arg.update).toEqual(DATA);
    expect(arg.create).toEqual({ id: KONTAK_DESA_ID, ...DATA });
  });

  it('tanpa sesi → 401, akun non-admin (role 5) → 403, database tidak disentuh', async () => {
    noSession(401);
    expect((await send('PUT', BODY)).status).toBe(401);
    asRole('5');
    const res = await send('PUT', BODY);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ success: false, message: PESAN_ADMIN_KONTAK_DESA });
    expect(kontak.upsert).not.toHaveBeenCalled();
  });

  it.each([
    ['namaKantor kosong', { namaKantor: '  ' }, 'Nama kantor wajib diisi'],
    ['alamat kosong', { alamat: '' }, 'Alamat wajib diisi'],
    ['telepon bukan nomor', { telepon: 'abc' }, /^Telepon tidak valid/],
    ['telepon kosong', { telepon: '' }, 'Telepon wajib diisi'],
    ['email salah format', { email: 'bukan-email' }, 'Format email tidak valid, mis. nama@desa.id'],
    ['email kosong', { email: '' }, 'Email wajib diisi'],
    ['alamat terlalu panjang', { alamat: 'x'.repeat(301) }, 'Alamat maksimal 300 karakter'],
  ])('400 bila %s', async (_label, patch, message) => {
    const res = await send('PUT', { ...BODY, ...patch });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(message instanceof RegExp ? message : new RegExp(`^${message}$`));
    expect(kontak.upsert).not.toHaveBeenCalled();
  });

  it('WhatsApp opsional: tanpa field WhatsApp tetap 200 dan tersimpan null', async () => {
    kontak.upsert.mockResolvedValue(ROW);
    expect((await send('PUT', BODY)).status).toBe(200);
    expect(kontak.upsert.mock.calls[0][0].update.whatsapp).toBeNull();
  });

  it('WhatsApp seluler valid diteruskan dan muncul di respons; dikosongkan kembali = null (nomor dihapus)', async () => {
    kontak.upsert.mockResolvedValue({ ...ROW, whatsapp: '0812 3958 0000' });
    const res = await send('PUT', { ...BODY, whatsapp: ' 0812  3958 0000 ' });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ data: { whatsapp: '0812 3958 0000' } });
    expect(kontak.upsert.mock.calls[0][0].update.whatsapp).toBe('0812 3958 0000');

    kontak.upsert.mockResolvedValue(ROW);
    await send('PUT', { ...BODY, whatsapp: '' });
    expect(kontak.upsert.mock.calls[1][0].update.whatsapp).toBeNull();
  });

  it('400 bila WhatsApp diisi tetapi bukan nomor seluler (telepon tetap/teks), database tidak disentuh', async () => {
    for (const whatsapp of ['(0361) 8441518', 'abc']) {
      const res = await send('PUT', { ...BODY, whatsapp });
      expect(res.status, whatsapp).toBe(400);
      expect((await res.json()).message).toMatch(/^WhatsApp tidak valid/);
    }
    expect(kontak.upsert).not.toHaveBeenCalled();
  });

  it('jam layanan opsional: tanpa field tetap 200 dan null; terisi diteruskan rapi; dikosongkan = null', async () => {
    kontak.upsert.mockResolvedValue(ROW);
    expect((await send('PUT', BODY)).status).toBe(200);
    expect(kontak.upsert.mock.calls[0][0].update.jamLayanan).toBeNull();

    kontak.upsert.mockResolvedValue({ ...ROW, jamLayanan: 'Senin–Jumat 07.30–15.30' });
    const res = await send('PUT', { ...BODY, jamLayanan: ' Senin–Jumat  07.30–15.30 ' });
    expect(await res.json()).toMatchObject({ data: { jamLayanan: 'Senin–Jumat 07.30–15.30' } });
    expect(kontak.upsert.mock.calls[1][0].update.jamLayanan).toBe('Senin–Jumat 07.30–15.30');

    await send('PUT', { ...BODY, jamLayanan: '' });
    expect(kontak.upsert.mock.calls[2][0].update.jamLayanan).toBeNull();
  });

  it('400 bila jam layanan melebihi batas panjang, database tidak disentuh', async () => {
    const res = await send('PUT', { ...BODY, jamLayanan: 'x'.repeat(121) });
    expect(res.status).toBe(400);
    expect((await res.json()).message).toBe('Jam layanan maksimal 120 karakter');
    expect(kontak.upsert).not.toHaveBeenCalled();
  });

  it('field tidak dikirim sama sekali → 400 (bukan menimpa dengan kosong)', async () => {
    const res = await send('PUT', { namaKantor: 'Kantor Uji' });
    expect(res.status).toBe(400);
    expect(kontak.upsert).not.toHaveBeenCalled();
  });

  it('galat database → 500 berpesan umum tanpa detail internal', async () => {
    kontak.upsert.mockRejectedValue(new Error('deadlock on KontakDesa'));
    const res = await send('PUT', BODY);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ success: false, message: PESAN_GAGAL_SIMPAN_KONTAK_DESA });
  });
});

describe('registrasi', () => {
  it('modul terdaftar di router Desa (/api/desa/kontakdesa)', () => {
    const source = readFileSync('src/app/api/[[...slugs]]/_lib/desa/index.ts', 'utf8');
    expect(source).toContain('import KontakDesa from "./kontak-desa"');
    expect(source).toContain('.use(KontakDesa)');
  });
});
