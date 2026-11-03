// @vitest-environment node
// Flag "Produk Unggulan Desa" pada produk UMKM (PasarDesa.isUnggulan).
// Kontrak: aditif — tanpa param/field baru perilaku lama tidak berubah.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  pasarDesa: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import ProdukUmkm from '@/app/api/[[...slugs]]/_lib/ekonomi/umkm/produk';
import produkUmkmFindMany from '@/app/api/[[...slugs]]/_lib/ekonomi/umkm/produk/findMany';
import {
  buildProdukWhere,
  isUnggulanFilter,
} from '@/app/api/[[...slugs]]/_lib/ekonomi/umkm/produk/_where';
import umkmState from '@/app/admin/(dashboard)/_state/ekonomi/umkm/umkm';

// Bentuk where sebelum fitur ini ada — dipakai membuktikan kompatibilitas mundur.
const LEGACY_WHERE = { deletedAt: null, isActive: true };

const VALID_BODY = {
  nama: 'Genteng Press',
  harga: 5000,
  umkmId: 'umkm-1',
  kategoriId: 'kat-1',
};

const post = (path: string, body: unknown, method = 'POST') =>
  ProdukUmkm.handle(
    new Request(`http://localhost/umkm/produk${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.pasarDesa.findMany.mockResolvedValue([]);
  prismaMock.pasarDesa.count.mockResolvedValue(0);
  prismaMock.pasarDesa.create.mockResolvedValue({ id: 'p1' });
  prismaMock.pasarDesa.update.mockResolvedValue({ id: 'p1' });
});

describe('isUnggulanFilter', () => {
  it('hanya string "true" yang aktif', () => {
    expect(isUnggulanFilter('true')).toBe(true);
    for (const v of ['false', '1', 'TRUE', '', undefined, null, true]) {
      expect(isUnggulanFilter(v)).toBe(false);
    }
  });
});

describe('buildProdukWhere', () => {
  it('tanpa param unggulan → where identik dengan perilaku lama', () => {
    expect(buildProdukWhere({})).toEqual(LEGACY_WHERE);
    expect(buildProdukWhere({ unggulan: 'false' })).toEqual(LEGACY_WHERE);
    expect(buildProdukWhere({ unggulan: '' })).toEqual(LEGACY_WHERE);
  });

  it('unggulan=true → menambah isUnggulan:true tanpa melepas filter aktif', () => {
    expect(buildProdukWhere({ unggulan: 'true' })).toEqual({ ...LEGACY_WHERE, isUnggulan: true });
  });

  it('digabung dengan search & kategori & umkm', () => {
    expect(
      buildProdukWhere({ unggulan: 'true', search: 'gen', kategoriId: 'k1', umkmId: 'u1' }),
    ).toEqual({
      ...LEGACY_WHERE,
      isUnggulan: true,
      umkmId: 'u1',
      kategoriProdukId: 'k1',
      nama: { contains: 'gen', mode: 'insensitive' },
    });
  });
});

describe('GET find-many', () => {
  const run = (query: Record<string, string>) =>
    produkUmkmFindMany({ query } as never);

  it('unggulan=true → findMany & count memakai filter isUnggulan:true', async () => {
    await run({ unggulan: 'true' });
    const findArgs = prismaMock.pasarDesa.findMany.mock.calls[0][0];
    const countArgs = prismaMock.pasarDesa.count.mock.calls[0][0];
    expect(findArgs.where).toEqual({ ...LEGACY_WHERE, isUnggulan: true });
    expect(countArgs.where).toEqual({ ...LEGACY_WHERE, isUnggulan: true });
  });

  it('tanpa param → where lama, tidak ada kunci isUnggulan', async () => {
    await run({});
    const { where } = prismaMock.pasarDesa.findMany.mock.calls[0][0];
    expect(where).toEqual(LEGACY_WHERE);
    expect('isUnggulan' in where).toBe(false);
  });

  it('output menyertakan isUnggulan dan paginasi tetap', async () => {
    prismaMock.pasarDesa.findMany.mockResolvedValue([
      { id: 'a', nama: 'A', isUnggulan: true },
      { id: 'b', nama: 'B', isUnggulan: false },
    ]);
    prismaMock.pasarDesa.count.mockResolvedValue(2);
    const res = (await run({ page: '1', limit: '8' })) as unknown as {
      success: boolean; data: { isUnggulan: boolean }[]; total: number; totalPages: number; limit: number;
    };
    expect(res.success).toBe(true);
    expect(res.data.map((d) => d.isUnggulan)).toEqual([true, false]);
    expect(res).toMatchObject({ total: 2, totalPages: 1, limit: 8 });
    const args = prismaMock.pasarDesa.findMany.mock.calls[0][0];
    expect(args).toMatchObject({ skip: 0, take: 8, orderBy: { createdAt: 'desc' } });
  });
});

describe('POST /create', () => {
  it('menyimpan isUnggulan:true bila dikirim', async () => {
    const res = await post('/create', { ...VALID_BODY, isUnggulan: true });
    expect(res.status).toBe(200);
    expect(prismaMock.pasarDesa.create.mock.calls[0][0].data.isUnggulan).toBe(true);
  });

  it('klien lama tanpa isUnggulan tetap diterima → default false', async () => {
    const res = await post('/create', VALID_BODY);
    expect(res.status).toBe(200);
    expect(prismaMock.pasarDesa.create.mock.calls[0][0].data.isUnggulan).toBe(false);
  });

  it.each(['ya', 1, null])('isUnggulan=%j ditolak di boundary (bukan boolean)', async (bad) => {
    const res = await post('/create', { ...VALID_BODY, isUnggulan: bad });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(prismaMock.pasarDesa.create).not.toHaveBeenCalled();
  });

  it('field wajib lama tidak berubah (nama tetap wajib)', async () => {
    const tanpaNama: Partial<typeof VALID_BODY> = { ...VALID_BODY };
    delete tanpaNama.nama;
    const res = await post('/create', tanpaNama);
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('PUT /:id', () => {
  const UPDATE_BODY = { ...VALID_BODY, stok: 3, isActive: true };

  it('menyimpan isUnggulan (true lalu false)', async () => {
    await post('/p1', { ...UPDATE_BODY, isUnggulan: true }, 'PUT');
    expect(prismaMock.pasarDesa.update.mock.calls[0][0].data.isUnggulan).toBe(true);
    await post('/p1', { ...UPDATE_BODY, isUnggulan: false }, 'PUT');
    expect(prismaMock.pasarDesa.update.mock.calls[1][0].data.isUnggulan).toBe(false);
  });

  it('klien lama tanpa isUnggulan → flag tidak ditimpa (undefined)', async () => {
    const res = await post('/p1', UPDATE_BODY, 'PUT');
    expect(res.status).toBe(200);
    expect(prismaMock.pasarDesa.update.mock.calls[0][0].data.isUnggulan).toBeUndefined();
  });

  it('isUnggulan bukan boolean ditolak', async () => {
    const res = await post('/p1', { ...UPDATE_BODY, isUnggulan: 'true' }, 'PUT');
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(prismaMock.pasarDesa.update).not.toHaveBeenCalled();
  });
});

describe('state produk.findMany.load (query ke API)', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ json: async () => ({ success: true, data: [], totalPages: 1 }) });
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  const lastParams = () => new URL(fetchMock.mock.calls[0][0], 'http://localhost').searchParams;

  it('unggulan=true dikirim hanya bila diminta', async () => {
    await umkmState.produk.findMany.load(1, 8, '', undefined, undefined, true);
    expect(lastParams().get('unggulan')).toBe('true');
  });

  it('default (pemanggil lama) tidak mengirim param unggulan', async () => {
    await umkmState.produk.findMany.load(1, 8, '');
    expect(lastParams().has('unggulan')).toBe(false);
  });
});
