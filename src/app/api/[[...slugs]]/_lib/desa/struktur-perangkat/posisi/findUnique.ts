import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { fail, POSISI_SELECT } from "../http";

/** GET publik: detail satu jabatan; 404 bila tidak ada. */
export default async function posisiFindUnique(context: Context) {
  const { id } = context.params as { id: string };
  const data = await prisma.posisiPerangkatDesa.findUnique({ where: { id }, select: POSISI_SELECT });
  if (!data) return fail(context, 404, "Jabatan tidak ditemukan");
  return { success: true as const, message: "Berhasil mengambil jabatan", data };
}
