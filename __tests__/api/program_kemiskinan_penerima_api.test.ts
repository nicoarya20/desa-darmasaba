// @vitest-environment node
// API penerima Program Kemiskinan: publik hanya mengirim nama/alamat/tahun, wajib berpaginasi (limit
// dibatasi), hanya program & penerima aktif, rekap per alamat; admin dijaga role, validasi body di
// boundary, impor "ganti" menghapus data tahun itu dalam satu transaksi. Prisma di-mock; data rekaan.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthMock, prismaMock, tx } = vi.hoisted(() => {
  const penerima = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    aggregate: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  };
  const program = { findFirst: vi.fn(), findUnique: vi.fn() };
  const tx = { penerimaProgramKemiskinan: penerima };
  return {
    requireAuthMock: vi.fn(),
    tx,
    prismaMock: {
      penerimaProgramKemiskinan: penerima,
      programKemiskinan: program,
      $transaction: vi.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
    },
  };
});
vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import penerimaCreate from '@/app/api/[[...slugs]]/_lib/ekonomi/program-kemiskinan/penerima/create';
import penerimaAdminFindMany from '@/app/api/[[...slugs]]/_lib/ekonomi/program-kemiskinan/penerima/admin-find-many';
import penerimaImport from '@/app/api/[[...slugs]]/_lib/ekonomi/program-kemiskinan/penerima/import';
import programKemiskinanPublik from '@/app/api/[[...slugs]]/_lib/ekonomi/program-kemiskinan/publik/program-publik';
import {
  PENERIMA_PUBLIK_SELECT,
  penerimaPublikFindMany,
  penerimaPublikRekap,
} from '@/app/api/[[...slugs]]/_lib/ekonomi/program-kemiskinan/publik/penerima-publik';

const P = prismaMock.penerimaProgramKemiskinan;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context Elysia tiruan minimal
const ctx = (o: { params?: object; query?: object; body?: unknown }): any => ({ params: {}, query: {}, set: { headers: {} }, ...o });
// test-only: program rekaan
const PROGRAM = { id: 'prog-1', slug: 'pkh', nama: 'PKH', deskripsi: '<p>x</p>', icon: 'bantuan' };
const asRole = (roleId: string) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: `u-${roleId}`, roleId, isActive: true } });

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.programKemiskinan.findFirst.mockResolvedValue(PROGRAM);
  prismaMock.programKemiskinan.findUnique.mockResolvedValue({ id: 'prog-1' });
});

describe('publik: daftar penerima', () => {
  it('select hanya nama/alamat/tahun, penerima aktif program aktif (slug atau id), respons tanpa field lain', async () => {
    // Prisma mock sengaja mengembalikan kolom ekstra: handler harus meminta select sempit ke DB.
    P.findMany.mockResolvedValue([{ nama: 'Warga A', alamat: 'Br. Satu', tahun: 2025 }]);
    P.count.mockResolvedValue(1);
    const c = ctx({ params: { key: 'pkh' }, query: { tahun: '2025' } });
    const res = await penerimaPublikFindMany(c);

    expect(PENERIMA_PUBLIK_SELECT).toEqual({ nama: true, alamat: true, tahun: true });
    const arg = P.findMany.mock.calls[0][0];
    expect(arg.select).toEqual({ nama: true, alamat: true, tahun: true });
    expect(arg.where).toEqual({ programId: 'prog-1', tahun: 2025, isActive: true });
    expect(prismaMock.programKemiskinan.findFirst.mock.calls[0][0].where).toEqual({
      isActive: true,
      OR: [{ slug: 'pkh' }, { id: 'pkh' }],
    });
    expect(res).toMatchObject({ success: true, page: 1, limit: 20, total: 1, totalPages: 1 });
    if (!res.success) throw new Error('harus sukses');
    for (const row of res.data) expect(Object.keys(row).sort()).toEqual(['alamat', 'nama', 'tahun']);
  });

  it('paginasi: skip = (page-1)*limit, limit dipotong ke 50, search mencari nama & alamat', async () => {
    P.findMany.mockResolvedValue([]);
    P.count.mockResolvedValue(120);
    const res = await penerimaPublikFindMany(
      ctx({ params: { key: 'pkh' }, query: { tahun: '2026', page: '3', limit: '1000', search: '  br  satu ' } }),
    );
    const arg = P.findMany.mock.calls[0][0];
    expect(arg.take).toBe(50);
    expect(arg.skip).toBe(100);
    expect(arg.where.OR).toEqual([
      { nama: { contains: 'br satu', mode: 'insensitive' } },
      { alamat: { contains: 'br satu', mode: 'insensitive' } },
    ]);
    expect(res).toMatchObject({ page: 3, limit: 50, total: 120, totalPages: 3 });
  });

  it('page/limit rusak → default; tahun tidak valid → 400 tanpa query DB; program tak ada → 404', async () => {
    P.findMany.mockResolvedValue([]);
    P.count.mockResolvedValue(0);
    await penerimaPublikFindMany(ctx({ params: { key: 'pkh' }, query: { tahun: '2025', page: '-2', limit: 'abc' } }));
    expect(P.findMany.mock.calls[0][0]).toMatchObject({ skip: 0, take: 20 });

    const c400 = ctx({ params: { key: 'pkh' }, query: { tahun: '1890' } });
    expect(await penerimaPublikFindMany(c400)).toMatchObject({ success: false });
    expect(c400.set.status).toBe(400);

    prismaMock.programKemiskinan.findFirst.mockResolvedValue(null);
    const c404 = ctx({ params: { key: 'tidak-ada' }, query: { tahun: '2025' } });
    expect(await penerimaPublikFindMany(c404)).toEqual({ success: false, message: 'Program tidak ditemukan' });
    expect(c404.set.status).toBe(404);
  });
});

describe('publik: detail & rekap', () => {
  it('detail program + jumlah penerima aktif per tahun (terbaru dulu), tanpa daftar nama', async () => {
    P.groupBy.mockResolvedValue([
      { tahun: 2025, _count: { _all: 7 } },
      { tahun: 2026, _count: { _all: 3 } },
    ]);
    const res = await programKemiskinanPublik(ctx({ params: { key: 'pkh' } }));
    expect(P.groupBy.mock.calls[0][0].where).toEqual({ programId: 'prog-1', isActive: true });
    expect(res).toEqual({
      success: true,
      data: { ...PROGRAM, tahun: [{ tahun: 2026, jumlah: 3 }, { tahun: 2025, jumlah: 7 }] },
    });
  });

  it('rekap per alamat tahun terpilih: hanya agregat (alamat + jumlah), terbanyak dulu', async () => {
    P.groupBy.mockResolvedValue([
      { alamat: 'Br. Satu', _count: { _all: 2 } },
      { alamat: 'Br. Dua', _count: { _all: 5 } },
    ]);
    const res = await penerimaPublikRekap(ctx({ params: { key: 'pkh' }, query: { tahun: '2025' } }));
    expect(P.groupBy.mock.calls[0][0]).toMatchObject({ by: ['alamat'], where: { programId: 'prog-1', tahun: 2025, isActive: true } });
    expect(res).toEqual({
      success: true,
      tahun: 2025,
      data: [{ alamat: 'Br. Dua', jumlah: 5 }, { alamat: 'Br. Satu', jumlah: 2 }],
      lainnya: 0,
      total: 7,
    });
  });
});

describe('admin: guard & validasi', () => {
  it('tanpa sesi → 401, role publik (5) → 403; DB tidak disentuh', async () => {
    requireAuthMock.mockResolvedValue({
      authenticated: false,
      response: new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 }),
    });
    const c401 = ctx({ query: { programId: 'prog-1' } });
    expect(await penerimaAdminFindMany(c401)).toEqual({ success: false, message: 'Unauthorized' });
    expect(c401.set.status).toBe(401);
    asRole('5');
    const c403 = ctx({ body: { programId: 'prog-1', tahun: 2025, nama: 'A', alamat: 'B' } });
    expect(await penerimaCreate(c403)).toMatchObject({ success: false });
    expect(c403.set.status).toBe(403);
    expect(P.findMany).not.toHaveBeenCalled();
    expect(P.create).not.toHaveBeenCalled();
  });

  it('create: nama kosong/tahun tak wajar → 400; valid → dirapikan & urutan di akhir', async () => {
    asRole('1');
    const cKosong = ctx({ body: { programId: 'prog-1', tahun: 2025, nama: '   ', alamat: 'Br. Satu' } });
    expect(await penerimaCreate(cKosong)).toEqual({ success: false, message: 'Nama wajib diisi' });
    expect(cKosong.set.status).toBe(400);
    const cTahun = ctx({ body: { programId: 'prog-1', tahun: 3000, nama: 'A', alamat: 'B' } });
    await penerimaCreate(cTahun);
    expect(cTahun.set.status).toBe(400);

    P.aggregate.mockResolvedValue({ _max: { urutan: 4 } });
    P.create.mockResolvedValue({ id: 'p1' });
    await penerimaCreate(ctx({ body: { programId: 'prog-1', tahun: 2025, nama: ' Warga  A ', alamat: ' Br. Satu ' } }));
    expect(P.create.mock.calls[0][0].data).toEqual({ programId: 'prog-1', tahun: 2025, nama: 'Warga A', alamat: 'Br. Satu', urutan: 5 });
  });

  it('admin list menyertakan nonaktif + jumlah per tahun, limit dibatasi 100', async () => {
    asRole('0');
    P.findMany.mockResolvedValue([]);
    P.count.mockResolvedValue(0);
    P.groupBy.mockResolvedValue([{ tahun: 2025, _count: { _all: 2 } }]);
    const res = await penerimaAdminFindMany(ctx({ query: { programId: 'prog-1', tahun: '2025', limit: '500' } }));
    const arg = P.findMany.mock.calls[0][0];
    expect(arg.where).toEqual({ programId: 'prog-1', tahun: 2025 });
    expect(arg.take).toBe(100);
    expect(res).toMatchObject({ success: true, tahun: [{ tahun: 2025, jumlah: 2 }] });
  });
});

describe('admin: impor', () => {
  beforeEach(() => asRole('1'));

  it('mode ganti: hapus data tahun itu lalu isi ulang dari urutan 0; kolom selain nama/alamat dibuang', async () => {
    tx.penerimaProgramKemiskinan.deleteMany.mockResolvedValue({ count: 9 });
    tx.penerimaProgramKemiskinan.createMany.mockImplementation(async ({ data }: { data: unknown[] }) => ({ count: data.length }));
    // test-only: baris rekaan dengan kolom terlarang yang harus dibuang
    const rows = [
      { nama: 'Warga A', alamat: 'Br. Satu', nik: '5103000000000001' },
      { nama: 'Warga B', alamat: 'Br. Dua' },
    ];
    const res = await penerimaImport(ctx({ body: { programId: 'prog-1', tahun: 2026, mode: 'ganti', rows } }));
    expect(tx.penerimaProgramKemiskinan.deleteMany).toHaveBeenCalledWith({ where: { programId: 'prog-1', tahun: 2026 } });
    expect(tx.penerimaProgramKemiskinan.createMany.mock.calls[0][0].data).toEqual([
      { nama: 'Warga A', alamat: 'Br. Satu', programId: 'prog-1', tahun: 2026, urutan: 0 },
      { nama: 'Warga B', alamat: 'Br. Dua', programId: 'prog-1', tahun: 2026, urutan: 1 },
    ]);
    expect(res).toMatchObject({ success: true, data: { dihapus: 9, ditambah: 2 } });
  });

  it('mode tambah: tidak menghapus, urutan melanjutkan; satu baris tak valid → 400 seluruh impor', async () => {
    tx.penerimaProgramKemiskinan.aggregate.mockResolvedValue({ _max: { urutan: 2 } });
    tx.penerimaProgramKemiskinan.createMany.mockResolvedValue({ count: 1 });
    await penerimaImport(ctx({ body: { programId: 'prog-1', tahun: 2025, mode: 'tambah', rows: [{ nama: 'A', alamat: 'B' }] } }));
    expect(tx.penerimaProgramKemiskinan.deleteMany).not.toHaveBeenCalled();
    expect(tx.penerimaProgramKemiskinan.createMany.mock.calls[0][0].data[0].urutan).toBe(3);

    vi.clearAllMocks();
    asRole('1');
    const c = ctx({ body: { programId: 'prog-1', tahun: 2025, mode: 'tambah', rows: [{ nama: 'A', alamat: 'B' }, { nama: '', alamat: 'C' }] } });
    const res = await penerimaImport(c);
    expect(c.set.status).toBe(400);
    expect(res).toMatchObject({ success: false, message: expect.stringContaining('baris 2: Nama wajib diisi') });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
