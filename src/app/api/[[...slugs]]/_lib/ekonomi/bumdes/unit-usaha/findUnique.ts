import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { IMAGE_SELECT } from "../http";

/** GET publik: satu unit usaha berdasarkan id; 404 bila tidak ada atau sudah dihapus. */
export default async function unitUsahaFindUnique(context: Context) {
  const { id } = context.params as { id: string };

  const data = await prisma.unitUsahaBumDes.findFirst({
    where: { id, deletedAt: null },
    include: { image: IMAGE_SELECT },
  });

  if (!data) {
    context.set.status = 404;
    return { success: false, message: "Unit usaha tidak ditemukan" };
  }
  return { success: true, message: "Berhasil mengambil unit usaha BUMDes", data };
}
