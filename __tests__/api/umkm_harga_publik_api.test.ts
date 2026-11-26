// @vitest-environment node
// Saklar "Sembunyikan harga di website publik" (UmkmConfig): GET publik (tanpa baris = harga tampil) dan PUT khusus
// admin (user Google role 5 tidak boleh mengubah tampilan publik). Request HTTP lewat modul Elysia; prisma & auth di-mock.
import Elysia from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthMock, configMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  configMock: { findFirst: vi.fn(), update: vi.fn(), create: vi.fn() },
}));
vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/prisma', () => ({ default: { umkmConfig: configMock } }));

import PengaturanHargaProduk, {
  PESAN_HARGA_PUBLIK_BUKAN_ADMIN,
} from '@/app/api/[[...slugs]]/_lib/ekonomi/umkm/produk/pengaturan';
import { hargaPublikSchema, toHargaPublik } from '@/lib/umkm/harga-publik';

// test-only: baris DB rekaan.
const ROW = { id: 'cfg-1', sembunyikanHarga: true, createdAt: new Date(), updatedAt: new Date(), isActive: true };

const app = new Elysia({ prefix: '/api/ekonomi/umkm/produk' }).use(PengaturanHargaProduk);
const BASE = 'http://localhost/api/ekonomi/umkm/produk/pengaturan';
const put = (body: unknown) =>
  app.handle(new Request(`${BASE}/update`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
const asRole = (roleId: string) => ({ authenticated: true, user: { id: 'u-rekaan', roleId, isActive: true } }); // test-only

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('harga-publik lib', () => {
  it('tanpa baris aktif → harga tampil (perilaku sebelum saklar ada)', () => {
    expect(toHargaPublik(null)).toEqual({ sembunyikanHarga: false });
    expect(toHargaPublik(ROW)).toEqual({ sembunyikanHarga: true });
  });

  it('skema hanya menerima boolean', () => {
    expect(hargaPublikSchema.safeParse({ sembunyikanHarga: true }).success).toBe(true);
    expect(hargaPublikSchema.safeParse({ sembunyikanHarga: 'ya' }).success).toBe(false);
    expect(hargaPublikSchema.safeParse({}).success).toBe(false);
  });
});

describe('GET /pengaturan/find (publik)', () => {
  it('mengembalikan saklar tanpa perlu login, dari baris aktif terbaru', async () => {
    configMock.findFirst.mockResolvedValue(ROW);
    const res = await app.handle(new Request(`${BASE}/find`));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: { sembunyikanHarga: true } });
    expect(requireAuthMock).not.toHaveBeenCalled();
    expect(configMock.findFirst).toHaveBeenCalledWith({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
  });

  it('belum diatur → sembunyikanHarga false', async () => {
    configMock.findFirst.mockResolvedValue(null);
    const res = await app.handle(new Request(`${BASE}/find`));
    expect(await res.json()).toEqual({ success: true, data: { sembunyikanHarga: false } });
  });

  it('galat DB → 500 dengan pesan, bukan 200', async () => {
    configMock.findFirst.mockRejectedValue(new Error('db mati'));
    const res = await app.handle(new Request(`${BASE}/find`));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ success: false, message: 'Gagal mengambil pengaturan harga produk' });
  });
});

describe('PUT /pengaturan/update (admin)', () => {
  it('401 tanpa sesi, tidak menyentuh DB', async () => {
    requireAuthMock.mockResolvedValue({
      authenticated: false,
      response: new Response(JSON.stringify({ success: false, message: 'Unauthorized - Silakan login terlebih dahulu' }), { status: 401 }),
    });
    const res = await put({ sembunyikanHarga: true });
    expect(res.status).toBe(401);
    expect(configMock.update).not.toHaveBeenCalled();
    expect(configMock.create).not.toHaveBeenCalled();
  });

  it('403 untuk user Google biasa (role 5)', async () => {
    requireAuthMock.mockResolvedValue(asRole('5'));
    const res = await put({ sembunyikanHarga: true });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ success: false, message: PESAN_HARGA_PUBLIK_BUKAN_ADMIN });
    expect(configMock.update).not.toHaveBeenCalled();
  });

  it('body bukan boolean ditolak, tidak menyimpan', async () => {
    requireAuthMock.mockResolvedValue(asRole('2'));
    const res = await put({ sembunyikanHarga: 'ya' });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    expect(configMock.update).not.toHaveBeenCalled();
    expect(configMock.create).not.toHaveBeenCalled();
  });

  it('admin memperbarui baris aktif → pesan "disembunyikan"', async () => {
    requireAuthMock.mockResolvedValue(asRole('2'));
    configMock.findFirst.mockResolvedValue({ ...ROW, sembunyikanHarga: false });
    configMock.update.mockResolvedValue(ROW);
    const res = await put({ sembunyikanHarga: true });
    expect(res.status).toBe(200);
    expect(configMock.update).toHaveBeenCalledWith({ where: { id: 'cfg-1' }, data: { sembunyikanHarga: true } });
    expect(await res.json()).toEqual({
      success: true,
      message: 'Harga produk disembunyikan di website publik',
      data: { sembunyikanHarga: true },
    });
  });

  it('admin membuat baris bila belum ada → pesan "ditampilkan" saat dimatikan', async () => {
    requireAuthMock.mockResolvedValue(asRole('1'));
    configMock.findFirst.mockResolvedValue(null);
    configMock.create.mockResolvedValue({ ...ROW, sembunyikanHarga: false });
    const res = await put({ sembunyikanHarga: false });
    expect(res.status).toBe(200);
    expect(configMock.create).toHaveBeenCalledWith({ data: { sembunyikanHarga: false } });
    expect((await res.json()).message).toBe('Harga produk ditampilkan di website publik');
  });

  it('galat DB saat simpan → 500', async () => {
    requireAuthMock.mockResolvedValue(asRole('1'));
    configMock.findFirst.mockRejectedValue(new Error('db mati'));
    const res = await put({ sembunyikanHarga: true });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ success: false, message: 'Gagal menyimpan pengaturan harga produk' });
  });
});
