import prisma from "@/lib/prisma";
import { compareJenjang } from "@/lib/jenjang-pendidikan-urutan";

/** Filter satu segmen: baris dengan `jenjangId` tertentu, atau (segmen terakhir) jenjang di luar daftar aktif. */
export type JenjangSegmentFilter = { jenjangId: string | { notIn: string[] } };

/**
 * Filter segmen berurutan: satu per jenjang aktif menurut urutan baku, ditambah satu segmen sisa untuk baris yang
 * jenjangnya sudah nonaktif — supaya total sama persis dengan query tanpa urutan.
 */
export async function jenjangSegmentFilters(): Promise<JenjangSegmentFilter[]> {
  const jenjang = await prisma.jenjangPendidikan.findMany({
    where: { isActive: true },
    select: { id: true, nama: true },
  });
  const ids = jenjang.sort((a, b) => compareJenjang(a.nama, b.nama)).map((j) => j.id);
  return [...ids.map((id) => ({ jenjangId: id })), { jenjangId: { notIn: ids } }];
}

export type Segment<T> = {
  count: () => Promise<number>;
  fetch: (skip: number, take: number) => Promise<T[]>;
};

/**
 * Satu halaman dari segmen-segmen berurutan tanpa memuat seluruh tabel: hitung tiap segmen, lalu ambil hanya potongan
 * yang jatuh di rentang [skip, skip + take). Prisma tidak bisa `ORDER BY` urutan buatan, jadi urutan disusun per segmen.
 */
export async function paginateSegments<T>(
  segments: readonly Segment<T>[],
  skip: number,
  take: number,
): Promise<{ data: T[]; total: number }> {
  const counts = await Promise.all(segments.map((segment) => segment.count()));
  const total = counts.reduce((sum, n) => sum + n, 0);
  const slices: Promise<T[]>[] = [];
  let start = 0;
  segments.forEach((segment, i) => {
    const end = start + counts[i];
    const from = Math.max(skip, start);
    const to = Math.min(skip + take, end);
    if (from < to) slices.push(segment.fetch(from - start, to - from));
    start = end;
  });
  return { data: (await Promise.all(slices)).flat(), total };
}
