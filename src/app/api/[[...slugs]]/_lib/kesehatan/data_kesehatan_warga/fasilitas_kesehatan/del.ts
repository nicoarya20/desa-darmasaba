import prisma from "@/lib/prisma";
import { Context } from "elysia";

const fasilitasKesehatanDelete = async (context: Context) => {
  const id = context.params?.id as string;

  const data = await prisma.fasilitasKesehatan.findUnique({ where: { id } });
  if (!data) return { status: 404, message: "Data tidak ditemukan" };

  await prisma.fasilitasKesehatan.delete({ where: { id } });

  return { success: true, message: "Berhasil dihapus" };
};

export default fasilitasKesehatanDelete;
