import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function banjarFindUnique(context: Context) {
  const id = context.params?.id as string;

  if (!id) {
    return Response.json({ success: false, message: "ID wajib diisi" }, { status: 400 });
  }

  try {
    const data = await prisma.banjar.findUnique({ where: { id } });
    if (!data) {
      return Response.json({ success: false, message: "Banjar tidak ditemukan" }, { status: 404 });
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching banjar:", error);
    throw new Error("Gagal mengambil data banjar");
  }
}
