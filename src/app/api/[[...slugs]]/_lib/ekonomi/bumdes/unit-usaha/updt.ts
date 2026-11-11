import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { IMAGE_SELECT, validationFailure, writeFailure } from "../http";
import { unitUsahaUpdateSchema } from "./validation";

/** PUT (admin): ubah sebagian/seluruh field unit usaha; 404 bila tidak ada atau sudah dihapus. */
export default async function unitUsahaUpdate(context: Context) {
  const { id } = context.params as { id: string };

  const parsed = unitUsahaUpdateSchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);

  const existing = await prisma.unitUsahaBumDes.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    context.set.status = 404;
    return { success: false, message: "Unit usaha tidak ditemukan" };
  }

  try {
    const data = await prisma.unitUsahaBumDes.update({
      where: { id },
      data: parsed.data,
      include: { image: IMAGE_SELECT },
    });
    return { success: true, message: "Unit usaha berhasil diperbarui", data };
  } catch (error) {
    return writeFailure(error, context);
  }
}
