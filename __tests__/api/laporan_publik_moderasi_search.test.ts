// @vitest-environment node
// Pencarian global tanpa `type` (semua modul sekaligus): laporan publik yang menunggu verifikasi tidak ikut.
// Prisma ditiru dengan Proxy (model apa pun → findMany kosong) karena jalur ini memanggil puluhan model.
import { describe, expect, it, vi } from 'vitest';

const laporanFindMany = vi.hoisted(() => vi.fn<(args: { where: unknown }) => Promise<unknown[]>>(async () => []));
vi.mock('@/lib/prisma', () => {
  const model = (nama: string | symbol) =>
    new Proxy({}, { get: (_t, metode) => (nama === 'laporanPublik' && metode === 'findMany' ? laporanFindMany : vi.fn(async () => [])) });
  return { default: new Proxy({}, { get: (_t, nama) => model(nama) }) };
});

import searchFindMany from '@/app/api/[[...slugs]]/_lib/search/findMany';

describe('Pencarian global semua modul', () => {
  it('query laporan publik menyaring status Baru', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context Elysia tiruan minimal
    await searchFindMany({ query: { query: 'sampah' } } as any);
    expect(laporanFindMany).toHaveBeenCalledTimes(1);
    expect(laporanFindMany.mock.calls[0][0]).toMatchObject({ where: { status: { not: 'Baru' } } });
  });
});
