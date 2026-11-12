import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { fail, POSISI_SELECT, validationFailure } from "../http";
import { checkPosisiParent } from "./parent";
import { posisiCreateSchema } from "./validation";

/** POST (admin): tambah jabatan; 400 bila body tidak valid atau atasan tidak ada. */
export default async function posisiCreate(context: Context) {
  const parsed = posisiCreateSchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);
  const { nama, hierarki, deskripsi, urutan, parentId } = parsed.data;

  const parent = await checkPosisiParent(undefined, parentId);
  if (!parent.ok) return fail(context, 400, parent.message);

  const data = await prisma.posisiPerangkatDesa.create({
    data: {
      nama,
      hierarki,
      deskripsi: deskripsi ?? null,
      urutan: urutan ?? 0,
      parentId: parentId ?? null,
    },
    select: POSISI_SELECT,
  });
  return { success: true as const, message: "Jabatan berhasil ditambahkan", data };
}
