/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { toDuplicateResponse } from "@/lib/prisma-error";
import {
  susunDataUpdate,
  type ProgramInovasiUpdateBody,
} from "@/lib/program-inovasi";
import { Context } from "elysia";
import removeReleasedFiles, { fileIds } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";

/** Rujukan berkas (logo + galeri) yang dibandingkan sebelum/sesudah update. */
const GAMBAR_SELECT = { imageId: true, images: { select: { id: true } } } as const;

export default async function programInovasiUpdate(context: Context) {
  const body = context.body as ProgramInovasiUpdateBody;

  const id = context.params.id;

  if (!id) {
    return {
      success: false,
      message: "ID program inovasi wajib diisi",
    };
  }

  const hasil = susunDataUpdate(body);
  if (!hasil.ok) {
    context.set.status = 400;
    return { success: false, message: hasil.message };
  }

  try {
    const before = await prisma.programInovasi.findUnique({ where: { id }, select: GAMBAR_SELECT });
    const updated = await prisma.programInovasi.update({
      where: { id },
      data: {
        ...hasil.data,
        updatedAt: new Date(),
      },
      include: {
        image: true,
        images: true,
      },
    });
    await removeReleasedFiles(
      "ProgramInovasi",
      fileIds(before?.imageId, before?.images ?? []),
      fileIds(updated.imageId, updated.images),
    );

    return {
      success: true,
      message: "Program inovasi berhasil diperbarui",
      data: updated,
    };
  } catch (error: any) {
    // Ganti nama ke nilai lain yang sudah ada → 409 "Nama sudah dipakai"
    const duplicate = toDuplicateResponse(error);
    if (duplicate) {
      context.set.status = 409;
      return duplicate;
    }
    console.error("❌ Error update program inovasi:", error);
    return {
      success: false,
      message: "Gagal memperbarui data program inovasi",
      error: error.message,
    };
  }
}
