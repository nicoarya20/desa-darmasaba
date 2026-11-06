import prisma from "@/lib/prisma";
import { parseDokumenPerencanaanInput } from "@/lib/dokumen-perencanaan";
import { toForeignKeyResponse } from "@/lib/prisma-error";
import { Context } from "elysia";
import { FILE_SELECT, checkPdfFile } from "./file-check";

/** Admin: ubah dokumen perencanaan; fileId tidak dikirim = berkas lama dipertahankan. */
async function dokumenPerencanaanUpdate(context: Context) {
  const { id } = context.params as { id: string };

  const parsed = parseDokumenPerencanaanInput(context.body as Record<string, unknown>);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.message };
  }

  const { fileId, ...fields } = parsed.data;

  try {
    const existing = await prisma.dokumenPerencanaan.findFirst({
      where: { id, isActive: true },
      select: { id: true },
    });
    if (!existing) {
      context.set.status = 404;
      return { success: false, message: "Dokumen perencanaan tidak ditemukan" };
    }

    const fileError = await checkPdfFile(fileId);
    if (fileError) {
      context.set.status = 400;
      return { success: false, message: fileError };
    }

    const data = await prisma.dokumenPerencanaan.update({
      where: { id },
      data: fileId === undefined ? fields : { ...fields, fileId },
      include: { file: FILE_SELECT },
    });
    return { success: true, message: "Dokumen perencanaan berhasil diupdate", data };
  } catch (e) {
    const fk = toForeignKeyResponse(e);
    if (fk) {
      context.set.status = 422;
      return fk;
    }
    console.error("Error di dokumenPerencanaanUpdate:", e);
    return { success: false, message: "Gagal mengupdate dokumen perencanaan" };
  }
}

export default dokumenPerencanaanUpdate;
