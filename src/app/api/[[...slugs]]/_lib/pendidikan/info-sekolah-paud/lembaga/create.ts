import prisma from "@/lib/prisma";
import { lembagaCreateSchema } from "@/lib/lembaga-pendidikan/lembaga.validation";
import { Context } from "elysia";
import { validationFailure, writeFailure } from "../../../_struktur-organisasi/http";
import { dataLembaga } from "./lembaga.data";

/** POST (admin): tambah lembaga (nama + jenjang) beserta detail sekolah opsional. */
export default async function lembagaPendidikanCreate(context: Context) {
  const parsed = lembagaCreateSchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);

  try {
    const result = await prisma.lembaga.create({
      data: dataLembaga(parsed.data),
      include: { jenjangPendidikan: true },
    });
    return {
      success: true,
      message: "Berhasil membuat lembaga",
      data: result,
    };
  } catch (error) {
    return writeFailure(error, context);
  }
}
