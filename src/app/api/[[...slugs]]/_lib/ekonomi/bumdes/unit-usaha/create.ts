import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { IMAGE_SELECT, validationFailure, writeFailure } from "../http";
import { unitUsahaCreateSchema } from "./validation";

/** POST (admin): tambah unit usaha; `urutan` yang tidak dikirim diisi setelah urutan terbesar saat ini. */
export default async function unitUsahaCreate(context: Context) {
  const parsed = unitUsahaCreateSchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);

  try {
    let urutan = parsed.data.urutan;
    if (urutan === undefined) {
      const { _max } = await prisma.unitUsahaBumDes.aggregate({
        where: { deletedAt: null },
        _max: { urutan: true },
      });
      urutan = (_max.urutan ?? -1) + 1;
    }

    const data = await prisma.unitUsahaBumDes.create({
      data: { ...parsed.data, urutan },
      include: { image: IMAGE_SELECT },
    });
    return { success: true, message: "Unit usaha berhasil ditambahkan", data };
  } catch (error) {
    return writeFailure(error, context);
  }
}
