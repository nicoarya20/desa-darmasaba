/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";

type FormUpdateDesaAntiKorupsi = {
  name?: string;
  deskripsi?: string;
  fileId?: string;
  kategoriId?: string; // minimal satu kategori
};

export default async function desaAntiKorupsiUpdate(context: Context) {
  const body = context.body as FormUpdateDesaAntiKorupsi;

  const id = context.params.id;

  if (!id) {
    return {
      success: false,
      message: "ID desa anti korupsi wajib diisi",
    };
  }

  try {
    const updated = await prisma.desaAntiKorupsi.update({
      where: { id },    
      data: {
        name: body.name,
        deskripsi: body.deskripsi,
        fileId: body.fileId,
        kategoriId: body.kategoriId,
      },
      include: {
        file: true,
        kategori: true,
      },
    });

    return {
      success: true,
      message: "Desa anti korupsi berhasil diperbarui",
      data: updated,
    };
  } catch (error: any) {
    // Ganti nama ke nilai lain yang sudah ada → 409 "Nama sudah dipakai"
    const duplicate = toDuplicateResponse(error);
    if (duplicate) {
      context.set.status = 409;
      return duplicate;
    }
    console.error("❌ Error update desa anti korupsi:", error);
    return {
      success: false,
      message: "Gagal memperbarui data desa anti korupsi",
      error: error.message,
    };
  }
}
