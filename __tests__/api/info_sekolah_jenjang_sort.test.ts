// @vitest-environment node
/* eslint-disable @typescript-eslint/no-explicit-any -- mock Prisma membaca argumen `where`/respons handler yang bentuknya bebas */
// Baris tabel publik Info Sekolah diurutkan per jenjang (TK, SD, SMP, SMA, SMK) lewat query opsional `sort=jenjang`.
// Paginasi tetap di server: tiap jenjang = satu segmen, hanya potongan yang jatuh di halaman diminta yang diambil.
// Tanpa `sort` perilaku lama (urut nama, satu query) tidak berubah — dipakai admin.
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Row = { id: string; nama: string; jenjangId: string };

// test-only: jenjang dari API berurut nama (seperti yang dulu tampil), lembaga per jenjang.
const JENJANG = [
  { id: 'j-sma', nama: 'SMA' },
  { id: 'j-smp', nama: 'SMP' },
  { id: 'j-sd', nama: 'SD' },
  { id: 'j-tk', nama: 'TK' },
];
const ROWS: Record<string, Row[]> = {
  'j-tk': [{ id: 'tk1', nama: 'TK Satu', jenjangId: 'j-tk' }],
  'j-sd': ['1', '2', '3'].map((n) => ({ id: `sd${n}`, nama: `SD ${n}`, jenjangId: 'j-sd' })),
  'j-smp': [{ id: 'smp1', nama: 'SMP Satu', jenjangId: 'j-smp' }],
  'j-sma': ['1', '2'].map((n) => ({ id: `sma${n}`, nama: `SMA ${n}`, jenjangId: 'j-sma' })),
};

const segmentOf = (where: any): any => where?.AND?.[1];
const jenjangIdOf = (where: any): unknown => {
  const seg = segmentOf(where);
  return seg?.lembaga ? seg.lembaga.jenjangId : seg?.jenjangId;
};
const rowsFor = (where: any): Row[] => {
  const id = jenjangIdOf(where);
  return typeof id === 'string' ? ROWS[id] ?? [] : [];
};
const countFn = vi.fn(async ({ where }: any) => rowsFor(where).length);
const findManyFn = vi.fn(async ({ where, skip, take }: any) =>
  segmentOf(where) ? rowsFor(where).slice(skip, skip + take) : [],
);

const prismaMock = vi.hoisted(() => ({
  jenjangPendidikan: { findMany: vi.fn(), findFirst: vi.fn() },
  lembaga: { findMany: vi.fn(), count: vi.fn() },
  siswa: { findMany: vi.fn(), count: vi.fn() },
  pengajar: { findMany: vi.fn(), count: vi.fn() },
}));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import { compareJenjang, JENJANG_ORDER } from '@/lib/jenjang-pendidikan-urutan';
import {
  jenjangSegmentFilters,
  paginateSegments,
  type Segment,
} from '@/app/api/[[...slugs]]/_lib/pendidikan/info-sekolah-paud/jenjang-sort';
import lembagaFindMany from '@/app/api/[[...slugs]]/_lib/pendidikan/info-sekolah-paud/lembaga/findMany';
import siswaFindMany from '@/app/api/[[...slugs]]/_lib/pendidikan/info-sekolah-paud/siswa/findMany';
import pengajarFindMany from '@/app/api/[[...slugs]]/_lib/pendidikan/info-sekolah-paud/pengajar/findMany';
import jenjangFindMany from '@/app/api/[[...slugs]]/_lib/pendidikan/info-sekolah-paud/jenjang-pendidikan/findMany';

const ctx = (query: Record<string, string>) => ({ query }) as any;

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.jenjangPendidikan.findMany.mockResolvedValue(JENJANG);
  for (const model of [prismaMock.lembaga, prismaMock.siswa, prismaMock.pengajar]) {
    model.count.mockImplementation(countFn);
    model.findMany.mockImplementation(findManyFn);
  }
});

describe('urutan baku jenjang', () => {
  it('PAUD, TK, SD, SMP, SMA, SMK; case-insensitive; jenjang lain di belakang A–Z', () => {
    expect(JENJANG_ORDER).toEqual(['paud', 'tk', 'sd', 'smp', 'sma', 'smk']);
    expect(['SMA', 'Kursus', 'smk', 'SD', 'Akademi', 'TK'].sort(compareJenjang)).toEqual([
      'TK',
      'SD',
      'SMA',
      'smk',
      'Akademi',
      'Kursus',
    ]);
  });
});

describe('paginateSegments', () => {
  // test-only: segmen berisi angka berurutan agar potongan mudah dicek.
  const seg = (from: number, n: number): Segment<number> & { fetch: ReturnType<typeof vi.fn> } => ({
    count: async () => n,
    fetch: vi.fn(async (skip: number, take: number) =>
      Array.from({ length: n }, (_, i) => from + i).slice(skip, skip + take),
    ),
  });

  it('halaman yang melintasi batas segmen diambil dari dua segmen, urut', async () => {
    const segments = [seg(0, 3), seg(3, 0), seg(3, 4), seg(7, 2)];
    expect(await paginateSegments(segments, 2, 3)).toEqual({ data: [2, 3, 4], total: 9 });
    expect(segments[0].fetch).toHaveBeenCalledWith(2, 1);
    expect(segments[1].fetch).not.toHaveBeenCalled(); // segmen kosong tidak di-query
    expect(segments[2].fetch).toHaveBeenCalledWith(0, 2);
    expect(segments[3].fetch).not.toHaveBeenCalled(); // di luar halaman tidak di-query
  });

  it('semua halaman berurutan = seluruh baris tanpa celah/duplikat', async () => {
    const all: number[] = [];
    for (let skip = 0; skip < 9; skip += 4) {
      all.push(...(await paginateSegments([seg(0, 3), seg(3, 4), seg(7, 2)], skip, 4)).data);
    }
    expect(all).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('halaman di luar jangkauan → kosong, total tetap', async () => {
    expect(await paginateSegments([seg(0, 3)], 10, 5)).toEqual({ data: [], total: 3 });
  });
});

describe('jenjangSegmentFilters', () => {
  it('jenjang aktif diurutkan baku + segmen sisa untuk jenjang nonaktif', async () => {
    expect(await jenjangSegmentFilters()).toEqual([
      { jenjangId: 'j-tk' },
      { jenjangId: 'j-sd' },
      { jenjangId: 'j-smp' },
      { jenjangId: 'j-sma' },
      { jenjangId: { notIn: ['j-tk', 'j-sd', 'j-smp', 'j-sma'] } },
    ]);
    expect(prismaMock.jenjangPendidikan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } }),
    );
  });
});

describe('find-many lembaga ?sort=jenjang', () => {
  it('baris urut TK, SD, SMP, SMA; bentuk respons sama', async () => {
    const res: any = await lembagaFindMany(ctx({ page: '1', limit: '10', sort: 'jenjang' }));
    expect(res.data.map((r: Row) => r.id)).toEqual(['tk1', 'sd1', 'sd2', 'sd3', 'smp1', 'sma1', 'sma2']);
    expect(res).toMatchObject({ success: true, page: 1, limit: 10, total: 7, totalPages: 1 });
  });

  it('halaman 2 (limit 3) memotong lintas jenjang dengan benar', async () => {
    const res: any = await lembagaFindMany(ctx({ page: '2', limit: '3', sort: 'jenjang' }));
    expect(res.data.map((r: Row) => r.id)).toEqual(['sd3', 'smp1', 'sma1']);
    expect(res).toMatchObject({ total: 7, totalPages: 3 });
  });

  it('pencarian tetap berlaku di setiap segmen (AND dengan where dasar)', async () => {
    await lembagaFindMany(ctx({ sort: 'jenjang', search: 'negeri' }));
    const where = prismaMock.lembaga.count.mock.calls[0][0].where;
    expect(where.AND[0]).toMatchObject({ isActive: true, OR: expect.any(Array) });
  });

  it('tanpa sort → perilaku lama: satu findMany urut nama, tanpa query jenjang', async () => {
    prismaMock.lembaga.findMany.mockResolvedValue([]);
    prismaMock.lembaga.count.mockResolvedValue(0);
    await lembagaFindMany(ctx({ page: '1', limit: '10' }));
    expect(prismaMock.jenjangPendidikan.findMany).not.toHaveBeenCalled();
    expect(prismaMock.lembaga.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.lembaga.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true }, skip: 0, take: 10, orderBy: { nama: 'asc' } }),
    );
  });

  it('sort + filter satu jenjang → tidak dipecah segmen (semua baris sejenjang)', async () => {
    prismaMock.jenjangPendidikan.findFirst.mockResolvedValue({ id: 'j-sd', nama: 'SD' });
    prismaMock.lembaga.findMany.mockResolvedValue([]);
    prismaMock.lembaga.count.mockResolvedValue(0);
    await lembagaFindMany(ctx({ sort: 'jenjang', jenjangPendidikanId: 'sd' }));
    expect(prismaMock.jenjangPendidikan.findMany).not.toHaveBeenCalled();
    expect(prismaMock.lembaga.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { isActive: true, jenjangId: 'j-sd' } }));
  });
});

describe('find-many siswa ?sort=jenjang', () => {
  it('segmen menyaring lewat relasi lembaga.jenjangId, urut TK dulu', async () => {
    const res: any = await siswaFindMany(ctx({ page: '1', limit: '2', sort: 'jenjang' }));
    expect(res.data.map((r: Row) => r.id)).toEqual(['tk1', 'sd1']);
    expect(res.total).toBe(7);
    expect(segmentOf(prismaMock.siswa.count.mock.calls[0][0].where)).toEqual({ lembaga: { jenjangId: 'j-tk' } });
  });
});

describe('find-many pengajar ?sort=jenjang', () => {
  it('urut jenjang lewat relasi lembaga; tanpa sort tetap satu query urut nama', async () => {
    const res: any = await pengajarFindMany(ctx({ page: '3', limit: '3', sort: 'jenjang' }));
    expect(res.data.map((r: Row) => r.id)).toEqual(['sma2']);
    expect(res).toMatchObject({ total: 7, totalPages: 3 });

    vi.clearAllMocks();
    prismaMock.pengajar.findMany.mockResolvedValue([]);
    prismaMock.pengajar.count.mockResolvedValue(0);
    await pengajarFindMany(ctx({}));
    expect(prismaMock.jenjangPendidikan.findMany).not.toHaveBeenCalled();
    expect(prismaMock.pengajar.findMany).toHaveBeenCalledTimes(1);
  });
});

describe('find-many jenjang', () => {
  it('?hasLembaga=true → hanya jenjang yang punya lembaga aktif (PAUD/SMK tanpa sekolah tidak ditawarkan)', async () => {
    await jenjangFindMany(ctx({ page: '1', limit: '100', hasLembaga: 'true' }));
    expect(prismaMock.jenjangPendidikan.findMany).toHaveBeenCalledWith({
      where: { isActive: true, lembagas: { some: { isActive: true } } },
    });
  });

  it('tanpa parameter (admin) → semua jenjang aktif', async () => {
    await jenjangFindMany(ctx({ page: '1', limit: '10' }));
    expect(prismaMock.jenjangPendidikan.findMany).toHaveBeenCalledWith({ where: { isActive: true } });
  });

  it('selalu urut baku (admin & publik), total & paginasi dihitung setelah diurutkan', async () => {
    prismaMock.jenjangPendidikan.findMany.mockResolvedValue([
      ...JENJANG,
      { id: 'j-smk', nama: 'SMK' },
      { id: 'j-paud', nama: 'PAUD' },
    ]);
    const page1: any = await jenjangFindMany(ctx({ page: '1', limit: '4' }));
    expect(page1.data.map((j: { nama: string }) => j.nama)).toEqual(['PAUD', 'TK', 'SD', 'SMP']);
    expect(page1).toMatchObject({ success: true, total: 6, totalPages: 2 });
    const page2: any = await jenjangFindMany(ctx({ page: '2', limit: '4' }));
    expect(page2.data.map((j: { nama: string }) => j.nama)).toEqual(['SMA', 'SMK']);
  });

  it('?search= → cari di nama jenjang ATAU nama lembaga aktifnya (relasi lewat `some`)', async () => {
    const res: any = await jenjangFindMany(ctx({ search: 'Darmasaba' }));
    expect(res.success).toBe(true);
    expect(prismaMock.jenjangPendidikan.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        OR: [
          { nama: { contains: 'Darmasaba', mode: 'insensitive' } },
          { lembagas: { some: { isActive: true, nama: { contains: 'Darmasaba', mode: 'insensitive' } } } },
        ],
      },
    });
  });
});
