// @vitest-environment node
// API Inovasi Teknologi Desa (gabungan Desa Digital + Info Teknologi Tepat Guna): validasi `kategori` di body
// create/update dan saringan `?kategori=` find-many. Kontrak aditif: klien lama tanpa `kategori` tetap diterima.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  inovasiTeknologiDesa: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import InovasiTeknologiDesa from '@/app/api/[[...slugs]]/_lib/inovasi/inovasi-teknologi-desa';
import {
  buildInovasiWhere,
  parseKategoriFilter,
} from '@/app/api/[[...slugs]]/_lib/inovasi/inovasi-teknologi-desa/inovasi-teknologi.query';
import { INOVASI_KATEGORI } from '@/lib/inovasi-teknologi/kategori';

const BASE = 'http://localhost/inovasiteknologi';
// test-only
const BODY = { name: 'Pengering Gabah Surya', deskripsi: '<p>Alat pengering</p>', imageId: 'img-1' };

const send = (path: string, body: unknown, method = 'POST') =>
  InovasiTeknologiDesa.handle(
    new Request(`${BASE}${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  );
const get = (path: string) => InovasiTeknologiDesa.handle(new Request(`${BASE}${path}`));

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.inovasiTeknologiDesa.findMany.mockResolvedValue([]);
  prismaMock.inovasiTeknologiDesa.count.mockResolvedValue(0);
  prismaMock.inovasiTeknologiDesa.create.mockResolvedValue({ id: 'i1', ...BODY });
  prismaMock.inovasiTeknologiDesa.findUnique.mockResolvedValue({ id: 'i1', ...BODY, kategori: 'digital', image: null });
  prismaMock.inovasiTeknologiDesa.update.mockResolvedValue({ id: 'i1', ...BODY });
});

describe('POST /create — validasi kategori', () => {
  it('tanpa kategori (klien lama) → disimpan sebagai digital', async () => {
    const res = await send('/create', BODY);
    expect(res.status).toBe(200);
    expect(prismaMock.inovasiTeknologiDesa.create).toHaveBeenCalledWith({ data: { ...BODY, kategori: 'digital' } });
  });

  it.each(INOVASI_KATEGORI)('kategori sah "%s" diterima apa adanya', async (kategori) => {
    const res = await send('/create', { ...BODY, kategori });
    expect(res.status).toBe(200);
    expect(prismaMock.inovasiTeknologiDesa.create).toHaveBeenCalledWith({ data: { ...BODY, kategori } });
  });

  it.each(['smart-village', 'Digital', ''])('kategori tidak sah "%s" → 422, tidak menyentuh DB', async (kategori) => {
    const res = await send('/create', { ...BODY, kategori });
    expect(res.status).toBe(422);
    expect(prismaMock.inovasiTeknologiDesa.create).not.toHaveBeenCalled();
  });
});

describe('PUT /:id — kategori opsional', () => {
  it('tanpa kategori → kategori lama dipertahankan (field tidak dikirim ke Prisma)', async () => {
    const res = await send('/i1', BODY, 'PUT');
    expect(res.status).toBe(200);
    const { data } = prismaMock.inovasiTeknologiDesa.update.mock.calls[0][0];
    expect(data.kategori).toBeUndefined();
    expect(data.name).toBe(BODY.name);
  });

  it('pindah kategori ke tepat-guna', async () => {
    await send('/i1', { ...BODY, kategori: 'tepat-guna' }, 'PUT');
    expect(prismaMock.inovasiTeknologiDesa.update.mock.calls[0][0].data.kategori).toBe('tepat-guna');
  });

  it('kategori tidak sah → 422', async () => {
    const res = await send('/i1', { ...BODY, kategori: 'lainnya' }, 'PUT');
    expect(res.status).toBe(422);
    expect(prismaMock.inovasiTeknologiDesa.update).not.toHaveBeenCalled();
  });
});

describe('GET /find-many — saringan kategori', () => {
  it('?kategori=tepat-guna → where & count tersaring kategori, hanya entri aktif', async () => {
    const res = await get('/find-many?kategori=tepat-guna&page=2&limit=7');
    expect(res.status).toBe(200);
    const args = prismaMock.inovasiTeknologiDesa.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ isActive: true, kategori: 'tepat-guna' });
    expect(args.skip).toBe(7);
    expect(args.take).toBe(7);
    expect(prismaMock.inovasiTeknologiDesa.count).toHaveBeenCalledWith({ where: { isActive: true, kategori: 'tepat-guna' } });
  });

  it.each(['', 'semua'])('?kategori=%s → semua kategori', async (kategori) => {
    await get(`/find-many?kategori=${kategori}`);
    expect(prismaMock.inovasiTeknologiDesa.findMany.mock.calls[0][0].where).toEqual({ isActive: true });
  });

  it('kategori tak dikenal → 400 dan tidak query DB', async () => {
    const res = await get('/find-many?kategori=infotekno');
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ success: false, data: [] });
    expect(prismaMock.inovasiTeknologiDesa.findMany).not.toHaveBeenCalled();
  });

  it('respons membawa data + totalPages', async () => {
    prismaMock.inovasiTeknologiDesa.findMany.mockResolvedValue([{ id: 'i1', kategori: 'digital' }]);
    prismaMock.inovasiTeknologiDesa.count.mockResolvedValue(15);
    const body = await (await get('/find-many?limit=7')).json();
    expect(body).toMatchObject({ success: true, total: 15, totalPages: 3, data: [{ id: 'i1', kategori: 'digital' }] });
  });
});

describe('helper query', () => {
  it('parseKategoriFilter: trim, kosong/semua, tak dikenal', () => {
    expect(parseKategoriFilter(' digital ')).toEqual({ ok: true, kategori: 'digital' });
    expect(parseKategoriFilter(undefined)).toEqual({ ok: true });
    expect(parseKategoriFilter('semua')).toEqual({ ok: true });
    expect(parseKategoriFilter('x')).toEqual({ ok: false, value: 'x' });
  });

  it('buildInovasiWhere: kata kunci di nama & deskripsi (case-insensitive) + kategori', () => {
    expect(buildInovasiWhere({ search: ' pupuk ', kategori: 'tepat-guna' })).toEqual({
      isActive: true,
      kategori: 'tepat-guna',
      OR: [
        { name: { contains: 'pupuk', mode: 'insensitive' } },
        { deskripsi: { contains: 'pupuk', mode: 'insensitive' } },
      ],
    });
  });
});
