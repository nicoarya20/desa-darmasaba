import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { fail, POSISI_SELECT, validationFailure } from "../http";
import { checkPosisiParent } from "./parent";
import { posisiUpdateSchema } from "./validation";

/** PUT (admin): ubah jabatan; 404 bila tidak ada, 400 bila atasan tidak ada / diri sendiri / siklus. */
export default async function posisiUpdate(context: Context) {
  const { id } = context.params as { id: string };
  const parsed = posisiUpdateSchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);

  const existing = await prisma.posisiPerangkatDesa.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return fail(context, 404, "Jabatan tidak ditemukan");

  const parent = await checkPosisiParent(id, parsed.data.parentId);
  if (!parent.ok) return fail(context, 400, parent.message);

  // Field yang tidak dikirim (undefined) dibiarkan; string kosong sudah menjadi null.
  const data = await prisma.posisiPerangkatDesa.update({
    where: { id },
    data: parsed.data,
    select: POSISI_SELECT,
  });
  return { success: true as const, message: "Jabatan berhasil diperbarui", data };
}
