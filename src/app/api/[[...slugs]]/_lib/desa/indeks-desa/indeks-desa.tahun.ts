import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/** Apakah `error` pelanggaran indeks unik Prisma (P2002), mis. dua admin menyimpan tahun yang sama bersamaan. */
export function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/** Apakah tahun sudah dipakai baris lain (selain `exceptId` saat ubah). Dicek di semua baris: kolom `tahun` unik penuh. */
export async function isTahunDipakai(tahun: number, exceptId?: string): Promise<boolean> {
  const found = await prisma.indeksDesa.findFirst({
    where: { tahun, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    select: { id: true },
  });
  return found !== null;
}
