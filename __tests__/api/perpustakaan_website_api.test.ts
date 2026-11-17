// @vitest-environment node
// Pengaturan halaman penghubung Perpustakaan Digital: validasi bersama (URL https, panjang), GET publik, dan PUT
// khusus admin (user Google role 5 tidak boleh mengganti tautan publik). Request HTTP lewat modul Elysia; prisma &
// auth di-mock. Keputusan: docs/decisions/2026-11-17-perpustakaan-link-eksternal.md
import Elysia from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthMock, configMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  configMock: { findFirst: vi.fn(), update: vi.fn(), create: vi.fn() },
}));
vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/prisma', () => ({ default: { perpustakaanConfig: configMock } }));

import PengaturanPerpustakaan, {
  PESAN_PENGATURAN_BUKAN_ADMIN,
} from '@/app/api/[[...slugs]]/_lib/pendidikan/perpustakaan-digital/pengaturan';
import { DESKRIPSI_MAX, perpustakaanWebsiteSchema } from '@/lib/perpustakaan-website';

// test-only: isian valid & baris DB rekaan.
const VALID = {
  namaPlatform: 'Pustaka Ananta Loka',
  deskripsi: 'Perpustakaan digital resmi Desa Darmasaba.',
  websiteUrl: 'https://anantaloka.perpustakaan.co.id',
};
const ROW = { id: 'cfg-1', ...VALID, createdAt: new Date(), updatedAt: new Date(), isActive: true };

const app = new Elysia({ prefix: '/api/pendidikan/perpustakaandigital' }).use(PengaturanPerpustakaan);
const BASE = 'http://localhost/api/pendidikan/perpustakaandigital/pengaturan';
const put = (body: unknown) =>
  app.handle(new Request(`${BASE}/update`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
const asRole = (roleId: string) => ({ authenticated: true, user: { id: 'u-rekaan', roleId, isActive: true } }); // test-only

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('perpustakaanWebsiteSchema', () => {
  it('menerima isian valid dan memangkas spasi', () => {
    const parsed = perpustakaanWebsiteSchema.parse({ ...VALID, namaPlatform: '  Pustaka Ananta Loka  ' });
    expect(parsed.namaPlatform).toBe('Pustaka Ananta Loka');
  });

  it.each([
    ['http (bukan https)', 'http://anantaloka.perpustakaan.co.id'],
    ['javascript:', 'javascript:alert(1)'],
    ['bukan URL', 'anantaloka.perpustakaan.co.id'],
    ['berkredensial', 'https://user:rahasia@anantaloka.perpustakaan.co.id'],
  ])('menolak websiteUrl %s', (_label, websiteUrl) => {
    const result = perpustakaanWebsiteSchema.safeParse({ ...VALID, websiteUrl });
    expect(result.success).toBe(false);
  });

  it('menolak deskripsi melebihi batas dan nama terlalu pendek', () => {
    expect(perpustakaanWebsiteSchema.safeParse({ ...VALID, deskripsi: 'a'.repeat(DESKRIPSI_MAX + 1) }).success).toBe(false);
    expect(perpustakaanWebsiteSchema.safeParse({ ...VALID, namaPlatform: 'ab' }).success).toBe(false);
  });
});

describe('GET /pengaturan/find (publik)', () => {
  it('mengembalikan bidang publik saja tanpa perlu login', async () => {
    configMock.findFirst.mockResolvedValue(ROW);
    const res = await app.handle(new Request(`${BASE}/find`));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: VALID });
    expect(requireAuthMock).not.toHaveBeenCalled();
    expect(configMock.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { isActive: true } }));
  });

  it('data null bila belum diatur', async () => {
    configMock.findFirst.mockResolvedValue(null);
    const res = await app.handle(new Request(`${BASE}/find`));
    expect(await res.json()).toEqual({ success: true, data: null });
  });

  it('galat DB → 500 dengan pesan, bukan 200', async () => {
    configMock.findFirst.mockRejectedValue(new Error('db mati'));
    const res = await app.handle(new Request(`${BASE}/find`));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ success: false, message: 'Gagal mengambil pengaturan perpustakaan' });
  });
});

describe('PUT /pengaturan/update (admin)', () => {
  it('401 tanpa sesi, tidak menyentuh DB', async () => {
    requireAuthMock.mockResolvedValue({
      authenticated: false,
      response: new Response(JSON.stringify({ success: false, message: 'Unauthorized - Silakan login terlebih dahulu' }), { status: 401 }),
    });
    const res = await put(VALID);
    expect(res.status).toBe(401);
    expect(configMock.update).not.toHaveBeenCalled();
    expect(configMock.create).not.toHaveBeenCalled();
  });

  it('403 untuk user Google biasa (role 5)', async () => {
    requireAuthMock.mockResolvedValue(asRole('5'));
    const res = await put(VALID);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ success: false, message: PESAN_PENGATURAN_BUKAN_ADMIN });
    expect(configMock.update).not.toHaveBeenCalled();
  });

  it('400 bila URL bukan https, tidak menyimpan', async () => {
    requireAuthMock.mockResolvedValue(asRole('4'));
    const res = await put({ ...VALID, websiteUrl: 'http://contoh.id' });
    expect(res.status).toBe(400);
    expect((await res.json()).success).toBe(false);
    expect(configMock.update).not.toHaveBeenCalled();
  });

  it('admin memperbarui baris aktif yang ada', async () => {
    requireAuthMock.mockResolvedValue(asRole('4'));
    configMock.findFirst.mockResolvedValue(ROW);
    configMock.update.mockResolvedValue({ ...ROW, websiteUrl: 'https://baru.perpustakaan.co.id' });
    const res = await put({ ...VALID, websiteUrl: ' https://baru.perpustakaan.co.id ' });
    expect(res.status).toBe(200);
    expect(configMock.update).toHaveBeenCalledWith({
      where: { id: 'cfg-1' },
      data: { ...VALID, websiteUrl: 'https://baru.perpustakaan.co.id' },
    });
    expect((await res.json()).data.websiteUrl).toBe('https://baru.perpustakaan.co.id');
  });

  it('admin membuat baris bila belum ada', async () => {
    requireAuthMock.mockResolvedValue(asRole('1'));
    configMock.findFirst.mockResolvedValue(null);
    configMock.create.mockResolvedValue(ROW);
    const res = await put(VALID);
    expect(res.status).toBe(200);
    expect(configMock.create).toHaveBeenCalledWith({ data: VALID });
  });
});
