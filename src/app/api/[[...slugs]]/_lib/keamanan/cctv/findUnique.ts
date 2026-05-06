import prisma from "@/lib/prisma";
import { Context } from "elysia";

const cctvFindUnique = async (context: Context) => {
  const id = context.params.id as string;

  const data = await prisma.cctvKeamanan.findUnique({ where: { id } });

  if (!data) {
    return { success: false, message: "CCTV tidak ditemukan" };
  }

  return { success: true, data };
};

export default cctvFindUnique;
