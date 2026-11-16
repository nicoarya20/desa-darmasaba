import prisma from "@/lib/prisma";
import { Context } from "elysia";

/** Detail satu baris dinamika penduduk berdasarkan id. */
export default async function dinamikaPendudukFindUnique(context: Context) {
  const id = context.params?.id as string;

  const data = await prisma.dinamikaPenduduk.findUnique({ where: { id } });
  if (!data) {
    context.set.status = 404;
    return { success: false, message: "Data tidak ditemukan" };
  }

  return { success: true, message: "Data ditemukan", data };
}
