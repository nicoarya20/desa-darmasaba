import { cache } from "react";
import prisma from "@/lib/prisma";

/**
 * Satu program inovasi AKTIF beserta logo + galeri untuk halaman detail publik yang dirender di server.
 * `null` = tidak ada atau nonaktif (halaman → 404). Di-`cache` per request agar `generateMetadata` dan
 * halaman berbagi satu query.
 */
export const getProgramInovasiPublik = cache(async (id: string) => {
  try {
    return await prisma.programInovasi.findFirst({
      where: { id, isActive: true },
      include: { image: true, images: true },
    });
  } catch (error) {
    throw new Error(`Gagal memuat program inovasi ${id}: ${(error as Error).message}`);
  }
});

export type ProgramInovasiPublik = NonNullable<Awaited<ReturnType<typeof getProgramInovasiPublik>>>;
