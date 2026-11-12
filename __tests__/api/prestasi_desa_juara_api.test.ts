// @vitest-environment node
// Kontrak endpoint landing_page/prestasi-desa setelah Penghargaan digabung: field `juara` aditif & opsional.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  prestasiDesa: {
    findFirst: vi.fn(),
    findUnique: vi.fn(), // gambar lama dibaca sebelum update (dihapus setelah update sukses)
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import PrestasiDesa from '@/app/api/[[...slugs]]/_lib/landing_page/prestasi-desa';
import { normalizeJuara } from '@/app/api/[[...slugs]]/_lib/landing_page/prestasi-desa/juara';

const BASE = { name: 'Juara Lomba Desa', deskripsi: '<p>x</p>', imageId: 'img1', kategoriId: 'k1' };

const send = (path: string, body: unknown, method = 'POST') =>
  PrestasiDesa.handle(
    new Request(`http://localhost/prestasidesa${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

const dataOf = (fn: ReturnType<typeof vi.fn>) => (fn.mock.calls[0][0] as { data: Record<string, unknown> }).data;

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.prestasiDesa.findFirst.mockResolvedValue(null);
  prismaMock.prestasiDesa.create.mockResolvedValue({ id: 'p1' });
  prismaMock.prestasiDesa.update.mockResolvedValue({ id: 'p1' });
  prismaMock.prestasiDesa.findMany.mockResolvedValue([]);
  prismaMock.prestasiDesa.count.mockResolvedValue(0);
});

describe('normalizeJuara', () => {
  it('trim; kosong/null → null; undefined tetap undefined (tidak diubah)', () => {
    expect(normalizeJuara('  Juara 1  ')).toBe('Juara 1');
    expect(normalizeJuara('   ')).toBeNull();
    expect(normalizeJuara(null)).toBeNull();
    expect(normalizeJuara(undefined)).toBeUndefined();
  });
});

describe('POST /prestasidesa/create — juara opsional', () => {
  it('tanpa juara (klien lama) tetap 200, disimpan null', async () => {
    const res = await send('/create', BASE);
    expect(res.status).toBe(200);
    expect(dataOf(prismaMock.prestasiDesa.create)).toMatchObject({ ...BASE, juara: null });
  });

  it('juara di-trim; string kosong → null', async () => {
    await send('/create', { ...BASE, juara: '  Juara 1 Lomba Desa Provinsi Bali 2025 ' });
    expect(dataOf(prismaMock.prestasiDesa.create).juara).toBe('Juara 1 Lomba Desa Provinsi Bali 2025');

    prismaMock.prestasiDesa.create.mockClear();
    await send('/create', { ...BASE, juara: '' });
    expect(dataOf(prismaMock.prestasiDesa.create).juara).toBeNull();
  });

  it('juara bukan string → 422, tidak menyentuh DB', async () => {
    const res = await send('/create', { ...BASE, juara: 1 });
    expect(res.status).toBe(422);
    expect(prismaMock.prestasiDesa.create).not.toHaveBeenCalled();
  });
});

describe('PUT /prestasidesa/:id — juara opsional', () => {
  it('tidak dikirim → tidak diubah (undefined ke Prisma)', async () => {
    const res = await send('/p1', { name: 'Baru' }, 'PUT');
    expect(res.status).toBe(200);
    const data = dataOf(prismaMock.prestasiDesa.update);
    expect(data.juara).toBeUndefined();
  });

  it('"" atau null → dikosongkan (null); nilai → di-trim', async () => {
    await send('/p1', { name: 'Baru', juara: '' }, 'PUT');
    await send('/p1', { name: 'Baru', juara: null }, 'PUT');
    await send('/p1', { name: 'Baru', juara: ' Peringkat IV ' }, 'PUT');
    const juara = prismaMock.prestasiDesa.update.mock.calls.map((c) => (c[0] as { data: { juara: unknown } }).data.juara);
    expect(juara).toEqual([null, null, 'Peringkat IV']);
  });

  it('juara bukan string → 422', async () => {
    const res = await send('/p1', { name: 'Baru', juara: { x: 1 } }, 'PUT');
    expect(res.status).toBe(422);
    expect(prismaMock.prestasiDesa.update).not.toHaveBeenCalled();
  });
});

describe('GET /prestasidesa/find-many — kebutuhan list gabungan', () => {
  it('search ikut mencari di juara; paginasi, urut terbaru, total', async () => {
    prismaMock.prestasiDesa.count.mockResolvedValue(9);
    const res = await PrestasiDesa.handle(new Request('http://localhost/prestasidesa/find-many?page=2&limit=4&search=mangupura'));
    const body = await res.json();

    const args = prismaMock.prestasiDesa.findMany.mock.calls[0][0];
    expect(args).toMatchObject({ skip: 4, take: 4, orderBy: { createdAt: 'desc' }, where: { isActive: true } });
    expect(args.where.OR).toContainEqual({ juara: { contains: 'mangupura', mode: 'insensitive' } });
    expect(body).toMatchObject({ success: true, total: 9, page: 2, totalPages: 3 });
  });
});
