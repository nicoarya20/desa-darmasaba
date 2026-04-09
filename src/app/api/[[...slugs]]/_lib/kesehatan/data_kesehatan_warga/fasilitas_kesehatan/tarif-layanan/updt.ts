import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormUpdate = {
  layanan: string;
  tarif: string;
};

export default async function tarifLayananUpdate(context: Context) {
  const body = (await context.body) as FormUpdate;
  const id = context.params.id as string;

  try {
    const result = await prisma.tarifDanLayanan.update({
      where: { id },
      data: {
        layanan: body.layanan,
        tarif: body.tarif,
      },
    });
    return {
      success: true,
      message: "Berhasil mengupdate data tarif layanan",
      data: result,
    };
  } catch (error) {
    console.error("Error updating data tarif layanan:", error);
    throw new Error(
      "Gagal mengupdate data tarif layanan: " + (error as Error).message
    );
  }
}
