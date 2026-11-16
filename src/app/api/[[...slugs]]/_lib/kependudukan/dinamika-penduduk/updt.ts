import prisma from "@/lib/prisma";
import type { DinamikaInput } from "@/lib/dinamika-penduduk";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";

/** Ubah dinamika satu tahun; id tidak ada → 404, pindah ke tahun yang sudah ada → 409. */
export default async function dinamikaPendudukUpdate(context: Context) {
  const id = context.params?.id as string;
  const { tahun, kelahiran, kematian, masuk, keluar } = context.body as DinamikaInput;

  const existing = await prisma.dinamikaPenduduk.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    context.set.status = 404;
    return { success: false, message: "Data tidak ditemukan" };
  }

  try {
    const data = await prisma.dinamikaPenduduk.update({
      where: { id },
      data: { tahun, kelahiran, kematian, masuk, keluar },
    });
    return { success: true, message: "Data dinamika penduduk berhasil diperbarui", data };
  } catch (error) {
    const duplicate = toDuplicateResponse(error);
    if (duplicate) {
      context.set.status = 409;
      return duplicate;
    }
    throw new Error(`Gagal memperbarui dinamika penduduk ${id}: ${(error as Error).message}`);
  }
}
