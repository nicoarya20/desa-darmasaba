import prisma from "@/lib/prisma";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";

export default async function kategoriDesaAntiKorupsiUpdate(context: Context) {
  const body = context.body as { name: string };
  const id = context.params?.id as string;

  // Validasi ID dan nama
  if (!id) {
    return {
      success: false,
      message: "ID is required",
    };
  }

  if (!body.name) {
    return {
      success: false,
      message: "Name is required",
    };
  }

  try {
    const kategoriDesaAntiKorupsi = await prisma.kategoriDesaAntiKorupsi.update({
      where: { id },
      data: {
        name: body.name,
      },
    });

    return {
      success: true,
      message: "Success update kategori desa anti korupsi",
      data: kategoriDesaAntiKorupsi,
    };
  } catch (error) {
    // Ganti nama ke kategori lain yang sudah ada → 409 "Nama sudah dipakai"
    const duplicate = toDuplicateResponse(error);
    if (duplicate) {
      context.set.status = 409;
      return duplicate;
    }
    console.error("Update error:", error);
    return {
      success: false,
      message: "Gagal update kategori desa anti korupsi",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
