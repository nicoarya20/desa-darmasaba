import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { fail, PEGAWAI_SELECT } from "../http";

/** GET publik: detail satu pegawai; 404 bila tidak ada. */
export default async function pegawaiFindUnique(context: Context) {
  const { id } = context.params as { id: string };
  const data = await prisma.perangkatDesa.findUnique({ where: { id }, select: PEGAWAI_SELECT });
  if (!data) return fail(context, 404, "Perangkat desa tidak ditemukan");
  return { success: true as const, message: "Berhasil mengambil perangkat desa", data };
}
