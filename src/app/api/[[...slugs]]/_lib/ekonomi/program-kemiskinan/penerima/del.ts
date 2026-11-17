import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { guardAdminPenerima, notFound } from "./penerima.body";

/** DELETE /penerima/del/:id — hapus permanen satu penerima (data warga tidak disimpan setelah dihapus). */
export default async function penerimaDelete(context: Context) {
  const ditolak = await guardAdminPenerima(context.set);
  if (ditolak) return ditolak;

  const id = String(context.params?.id ?? "");
  const hasil = await prisma.penerimaProgramKemiskinan.deleteMany({ where: { id } });
  if (hasil.count === 0) return notFound(context.set, "Penerima tidak ditemukan");
  return { success: true as const, message: "Penerima berhasil dihapus" };
}
