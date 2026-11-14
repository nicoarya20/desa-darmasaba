// @vitest-environment node
// Moderasi Laporan Publik (API): kiriman non-admin ditahan sebagai `Baru` + dibatasi per alamat; laporan `Baru`
// hanya terlihat lewat tampilan moderasi admin (?moderasi=true), tidak di daftar/detail/pencarian publik.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  laporanPublik: { create: vi.fn(), findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn() },
}));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
const authMock = vi.hoisted(() => ({ optionalAuth: vi.fn() }));
vi.mock('@/lib/api-auth', () => authMock);

import laporanPublikCreate from '@/app/api/[[...slugs]]/_lib/keamanan/laporan-publik/create';
import laporanPublikFindMany from '@/app/api/[[...slugs]]/_lib/keamanan/laporan-publik/findMany';
import laporanPublikFindUnique from '@/app/api/[[...slugs]]/_lib/keamanan/laporan-publik/findUnique';
import { pengirimKey } from '@/app/api/[[...slugs]]/_lib/keamanan/laporan-publik/moderasi';
import searchFindMany from '@/app/api/[[...slugs]]/_lib/search/findMany';

// test-only: user sesi
const ADMIN = { id: 'a1', roleId: '2', isActive: true };
const WARGA = { id: 'u1', roleId: '5', isActive: true };
const ADMIN_NONAKTIF = { id: 'a2', roleId: '1', isActive: false };
const BASE = { judul: 'Sampah liar', lokasi: 'Banjar Tengah', tanggalWaktu: '2026-11-05T02:00:00.000Z' };
const TAMPIL_PUBLIK = { status: { not: 'Baru' } };

type Opts = { body?: unknown; id?: string; query?: Record<string, string>; ip?: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context Elysia tiruan minimal
const ctx = ({ body, id, query = {}, ip = '10.0.0.1' }: Opts = {}): any => ({
  body,
  query,
  params: id ? { id } : {},
  request: new Request('http://localhost/api', { headers: { 'cf-connecting-ip': ip } }),
  set: { status: 200, headers: {} as Record<string, string> },
});

beforeEach(() => {
  vi.clearAllMocks();
  authMock.optionalAuth.mockResolvedValue(null);
  prismaMock.laporanPublik.create.mockImplementation(async ({ data }) => ({ id: 'lap-1', status: 'Proses', ...data }));
  prismaMock.laporanPublik.findMany.mockResolvedValue([]);
  prismaMock.laporanPublik.count.mockResolvedValue(0);
});

describe('POST create: status kiriman ditentukan sesi', () => {
  const statusTersimpan = () => prismaMock.laporanPublik.create.mock.calls[0][0].data.status;

  it.each([
    ['warga anonim', null],
    ['user login biasa (role 5)', WARGA],
    ['admin nonaktif', ADMIN_NONAKTIF],
  ])('%s → ditahan sebagai Baru', async (_nama, user) => {
    authMock.optionalAuth.mockResolvedValue(user);
    const res = await laporanPublikCreate(ctx({ body: BASE, ip: `10.1.0.${Math.random()}` }));
    expect(statusTersimpan()).toBe('Baru');
    expect(res).toMatchObject({ success: true, data: { status: 'Baru' } });
  });

  it('admin aktif → status bawaan schema (Proses), langsung tampil', async () => {
    authMock.optionalAuth.mockResolvedValue(ADMIN);
    await laporanPublikCreate(ctx({ body: BASE }));
    expect(prismaMock.laporanPublik.create.mock.calls[0][0].data).not.toHaveProperty('status');
  });
});

describe('POST create: batas kiriman non-admin per alamat', () => {
  it('kiriman ke-6 dalam jendela ditolak 429 + Retry-After, tanpa menyentuh DB', async () => {
    const ip = '10.2.0.1';
    for (let i = 0; i < 5; i++) await laporanPublikCreate(ctx({ body: BASE, ip }));
    expect(prismaMock.laporanPublik.create).toHaveBeenCalledTimes(5);

    const c = ctx({ body: BASE, ip });
    const res = await laporanPublikCreate(c);
    expect(c.set.status).toBe(429);
    expect(Number(c.set.headers['Retry-After'])).toBeGreaterThan(0);
    expect(res).toMatchObject({ success: false, message: expect.stringContaining('Terlalu banyak laporan') });
    expect(prismaMock.laporanPublik.create).toHaveBeenCalledTimes(5);

    // Alamat lain tidak ikut terblokir.
    await laporanPublikCreate(ctx({ body: BASE, ip: '10.2.0.2' }));
    expect(prismaMock.laporanPublik.create).toHaveBeenCalledTimes(6);
  });

  it('admin tidak dibatasi', async () => {
    authMock.optionalAuth.mockResolvedValue(ADMIN);
    for (let i = 0; i < 8; i++) await laporanPublikCreate(ctx({ body: BASE, ip: '10.3.0.1' }));
    expect(prismaMock.laporanPublik.create).toHaveBeenCalledTimes(8);
  });

  it('kunci alamat: cf-connecting-ip > entri pertama x-forwarded-for > x-real-ip > ember bersama', () => {
    const h = (o: Record<string, string>) => new Headers(o);
    expect(pengirimKey(h({ 'cf-connecting-ip': '1.1.1.1', 'x-forwarded-for': '9.9.9.9' }))).toBe('1.1.1.1');
    expect(pengirimKey(h({ 'x-forwarded-for': '2.2.2.2, 3.3.3.3' }))).toBe('2.2.2.2');
    expect(pengirimKey(h({ 'x-real-ip': '4.4.4.4' }))).toBe('4.4.4.4');
    expect(pengirimKey(h({}))).toBe('tanpa-alamat');
  });
});

describe('GET find-many: laporan Baru hanya untuk tampilan moderasi admin', () => {
  const whereDipakai = () => [
    prismaMock.laporanPublik.findMany.mock.calls[0][0].where,
    prismaMock.laporanPublik.count.mock.calls[0][0].where,
  ];

  it('publik: daftar & hitungan menyaring Baru', async () => {
    await laporanPublikFindMany(ctx());
    expect(whereDipakai()).toEqual([{ isActive: true, ...TAMPIL_PUBLIK }, { isActive: true, ...TAMPIL_PUBLIK }]);
  });

  it('?moderasi=true tanpa sesi admin diabaikan (tetap tampilan publik)', async () => {
    authMock.optionalAuth.mockResolvedValue(WARGA);
    await laporanPublikFindMany(ctx({ query: { moderasi: 'true' } }));
    expect(whereDipakai()[0]).toEqual({ isActive: true, ...TAMPIL_PUBLIK });
  });

  it('admin tanpa param (mis. sedang membuka halaman publik) tetap tampilan publik', async () => {
    authMock.optionalAuth.mockResolvedValue(ADMIN);
    await laporanPublikFindMany(ctx());
    expect(whereDipakai()[0]).toEqual({ isActive: true, ...TAMPIL_PUBLIK });
  });

  it('admin + ?moderasi=true: Baru ikut tampil', async () => {
    authMock.optionalAuth.mockResolvedValue(ADMIN);
    await laporanPublikFindMany(ctx({ query: { moderasi: 'true' } }));
    expect(whereDipakai()).toEqual([{ isActive: true }, { isActive: true }]);
  });
});

describe('GET /:id: laporan Baru "tidak ditemukan" bagi publik', () => {
  const laporan = (status: string) => ({ id: 'lap-1', ...BASE, status, penanganan: [] });

  it('publik membuka URL detail laporan Baru → tidak ditemukan', async () => {
    prismaMock.laporanPublik.findUnique.mockResolvedValue(laporan('Baru'));
    expect(await laporanPublikFindUnique(ctx({ id: 'lap-1' }))).toEqual({ success: false, message: 'Laporan publik tidak ditemukan' });
    expect(await laporanPublikFindUnique(ctx({ id: 'lap-1', query: { moderasi: 'true' } }))).toMatchObject({ success: false });
  });

  it('admin + ?moderasi=true bisa membuka laporan Baru', async () => {
    authMock.optionalAuth.mockResolvedValue(ADMIN);
    prismaMock.laporanPublik.findUnique.mockResolvedValue(laporan('Baru'));
    expect(await laporanPublikFindUnique(ctx({ id: 'lap-1', query: { moderasi: 'true' } }))).toMatchObject({ success: true, data: { status: 'Baru' } });
  });

  it('laporan yang sudah disetujui tetap terbuka untuk publik', async () => {
    prismaMock.laporanPublik.findUnique.mockResolvedValue(laporan('Proses'));
    expect(await laporanPublikFindUnique(ctx({ id: 'lap-1' }))).toMatchObject({ success: true, data: { status: 'Proses' } });
  });
});

describe('Pencarian global: laporan Baru tidak ikut', () => {
  it('type=laporanPublik menyaring Baru', async () => {
    await searchFindMany(ctx({ query: { query: 'sampah', type: 'laporanPublik' } }));
    expect(prismaMock.laporanPublik.findMany.mock.calls[0][0].where).toMatchObject(TAMPIL_PUBLIK);
  });
});
