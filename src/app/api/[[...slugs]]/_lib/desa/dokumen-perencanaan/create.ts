import prisma from "@/lib/prisma";
import { parseDokumenPerencanaanInput } from "@/lib/dokumen-perencanaan";
import { toForeignKeyResponse } from "@/lib/prisma-error";
import { Context } from "elysia";
import { FILE_SELECT, checkPdfFile } from "./file-check";

/** Admin: buat dokumen perencanaan baru (field disesuaikan dengan jenisnya). */
async function dokumenPerencanaanCreate(context: Context) {
  const parsed = parseDokumenPerencanaanInput(context.body as Record<string, unknown>);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.message };
  }

  const { fileId, ...fields } = parsed.data;

  try {
    const fileError = await checkPdfFile(fileId);
    if (fileError) {
      context.set.status = 400;
      return { success: false, message: fileError };
    }

    const data = await prisma.dokumenPerencanaan.create({
      data: { ...fields, fileId: fileId ?? null },
      include: { file: FILE_SELECT },
    });
    return { success: true, message: "Dokumen perencanaan berhasil dibuat", data };
  } catch (e) {
    const fk = toForeignKeyResponse(e);
    if (fk) {
      context.set.status = 422;
      return fk;
    }
    console.error("Error di dokumenPerencanaanCreate:", e);
    return { success: false, message: "Gagal membuat dokumen perencanaan" };
  }
}

export default dokumenPerencanaanCreate;
