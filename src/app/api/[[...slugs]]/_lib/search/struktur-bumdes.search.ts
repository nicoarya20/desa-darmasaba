import prisma from "@/lib/prisma";

/*
 * Sumber hasil pencarian tipe "strukturOrganisasi" (Struktur Pengurus BUMDes): pegawai BUMDes aktif pada jabatan
 * aktif — sama dengan yang tampil di bagan publik. Item membawa `name` (judul baris di `globalSearch.tsx`) dan `id`
 * pegawai (tautan profil `/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/[id]` di `searchUrl.tsx`).
 */

/** Item hasil pencarian Struktur BUMDes. */
export type StrukturBumdesSearchItem = { id: string; name: string; jabatan: string };

/** Cari pegawai BUMDes aktif berdasarkan nama, email, telepon, atau nama jabatan (tidak peka huruf besar/kecil). */
export async function searchStrukturBumdes(
  query: string,
  page: { skip?: number; take: number },
): Promise<StrukturBumdesSearchItem[]> {
  const contains = { contains: query, mode: "insensitive" as const };
  const rows = await prisma.pegawaiBumDes.findMany({
    where: {
      isActive: true,
      posisi: { isActive: true },
      OR: [{ namaLengkap: contains }, { email: contains }, { telepon: contains }, { posisi: { nama: contains } }],
    },
    select: { id: true, namaLengkap: true, posisi: { select: { nama: true } } },
    orderBy: [{ posisi: { hierarki: "asc" } }, { namaLengkap: "asc" }],
    skip: page.skip,
    take: page.take,
  });
  return rows.map((r) => ({ id: r.id, name: r.namaLengkap, jabatan: r.posisi.nama }));
}
