/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormUpdateSDGSDesa = {
  name?: string;
  imageId?: string;
  jumlah?: string;
};

export default async function sdgsDesaUpdate(context: Context) {
  const body = context.body as FormUpdateSDGSDesa;

  const id = context.params.id;

  if (!id) {
    return {
      success: false,
      message: "ID SDGS Desa wajib diisi",
    };
  }

  try {
    const updated = await prisma.sdgsDesa.update({
      where: { id },
      data: {
        name: body.name,
        imageId: body.imageId,
        jumlah: body.jumlah,
      },
      include: {
        image: true,
      },
    });

    return {
      success: true,
      message: "SDGS Desa berhasil diperbarui",
      data: updated,
    };
  } catch (error: any) {
    console.error("❌ Error update SDGS Desa:", error);
    return {
      success: false,
      message: "Gagal memperbarui data SDGS Desa",
      error: error.message,
    };
  }
}
