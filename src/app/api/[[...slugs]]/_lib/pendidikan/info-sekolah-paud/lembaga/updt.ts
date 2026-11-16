import prisma from "@/lib/prisma";
import { toForeignKeyResponse } from "@/lib/prisma-error";
import { lembagaUpdateSchema } from "@/lib/lembaga-pendidikan/lembaga.validation";
import { Context } from "elysia";
import { fail, validationFailure } from "../../../_struktur-organisasi/http";
import removeReleasedFiles from "../../../fileStorage/_lib/removeReleasedFiles";
import { berkasLembaga, dataLembaga, LEMBAGA_FILE_OWNER } from "./lembaga.data";

/**
 * PUT (admin): ubah lembaga. Field yang tidak dikirim dibiarkan; foto sekolah / bagan lama yang diganti atau
 * dikosongkan dihapus permanen setelah update sukses.
 */
export default async function lembagaPendidikanUpdate(context: Context) {
  const id = (context.params as { id?: string })?.id;
  if (!id) return fail(context, 400, "ID lembaga pendidikan wajib diisi");

  const parsed = lembagaUpdateSchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);

  const lama = await prisma.lembaga.findUnique({ where: { id }, select: { fotoSekolahId: true, fotoBaganStrukturId: true } });
  if (!lama) return fail(context, 404, "Lembaga pendidikan tidak ditemukan");

  try {
    const updated = await prisma.lembaga.update({
      where: { id },
      data: dataLembaga(parsed.data),
      include: { jenjangPendidikan: true },
    });
    await removeReleasedFiles(LEMBAGA_FILE_OWNER, berkasLembaga(lama), berkasLembaga(updated));
    return {
      success: true,
      message: "Lembaga pendidikan berhasil diperbarui",
      data: updated,
    };
  } catch (error) {
    const foreignKey = toForeignKeyResponse(error);
    if (foreignKey) return fail(context, 400, foreignKey.message);
    console.error(`[lembaga] Gagal update lembaga ${id}:`, error);
    return fail(context, 500, "Gagal memperbarui lembaga pendidikan");
  }
}
