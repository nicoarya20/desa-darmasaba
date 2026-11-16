import prisma from "@/lib/prisma";
import { pustuBodySchema } from "@/lib/pustu/pustu.validation";
import { Context } from "elysia";
import { validationFailure, writeFailure } from "../../_struktur-organisasi/http";
import { PUSTU_RINGKAS_SELECT, dataJam, dataKontak, dataPustu, keRingkas } from "./pustu.data";

/** POST (admin): tambah PUSTU beserta jam operasional & kontak (satu operasi nested, atomik). */
export default async function puskesmasCreate(context: Context) {
  const parsed = pustuBodySchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);
  const body = parsed.data;

  try {
    const created = await prisma.puskesmas.create({
      data: {
        ...dataPustu(body),
        jam: { create: dataJam(body) },
        kontak: { create: dataKontak(body) },
      },
      select: PUSTU_RINGKAS_SELECT,
    });
    return { success: true, message: "PUSTU berhasil ditambahkan", data: keRingkas(created) };
  } catch (error) {
    return writeFailure(error, context);
  }
}
