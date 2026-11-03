import prisma from "@/lib/prisma";
import { Context } from "elysia";

/** DELETE (admin): soft delete unit usaha (deletedAt + isActive=false); 404 bila tidak ada atau sudah dihapus. */
export default async function unitUsahaDelete(context: Context) {
  const { id } = context.params as { id: string };

  const existing = await prisma.unitUsahaBumDes.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    context.set.status = 404;
    return { success: false, message: "Unit usaha tidak ditemukan" };
  }

  await prisma.unitUsahaBumDes.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
  return { success: true, message: "Unit usaha berhasil dihapus", data: { id, deleted: true } };
}
