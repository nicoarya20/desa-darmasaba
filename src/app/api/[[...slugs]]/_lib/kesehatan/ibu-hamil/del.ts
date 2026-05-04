import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function ibuHamilDelete(context: Context) {
  const id = context.params?.id as string;

  if (!id) {
    return { success: false, message: "ID tidak diberikan" };
  }

  const existing = await prisma.ibuHamil.findUnique({ where: { id } });
  if (!existing) {
    return new Response(JSON.stringify({ success: false, message: "Data tidak ditemukan" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  await prisma.ibuHamil.update({ where: { id }, data: { isActive: false } });

  return { success: true, message: "Ibu hamil berhasil dihapus" };
}
