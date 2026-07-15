import prisma from "@/lib/prisma";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";

type FormUpdate = {
  name: string;
  tanggal: string;
  jenisKelaminId: string;
  ratingId: string;
  kelompokUmurId: string;
};

export default async function respondenUpdate(context: Context) {
  const body = (await context.body) as FormUpdate;
  const id = context.params.id as string;

  try {
    const result = await prisma.responden.update({
      where: { id },
      data: {
        name: body.name,
        tanggal: new Date(body.tanggal).toISOString(),
        jenisKelaminId: body.jenisKelaminId,
        ratingId: body.ratingId,
        kelompokUmurId: body.kelompokUmurId,
      },
    });
    return {
      success: true,
      message: "Berhasil mengupdate responden",
      data: result,
    };
  } catch (error) {
    // Ganti nama ke nilai lain yang sudah ada → 409 "Nama sudah dipakai"
    const duplicate = toDuplicateResponse(error);
    if (duplicate) {
      context.set.status = 409;
      return duplicate;
    }
    console.error("Error updating responden:", error);
    // Instead of throwing an error, return a proper JSON response
    return {
      success: false,
      message: "Gagal mengupdate responden: " + (error as Error).message,
      data: null,
    };
  }
}
