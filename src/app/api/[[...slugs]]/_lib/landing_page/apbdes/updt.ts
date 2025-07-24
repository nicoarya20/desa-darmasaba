/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdateAPBDes = {
  name?: string;
  imageId?: string;
  fileId?: string;
  jumlah?: string;
};

export default async function apbdesUpdate(context: Context) {
  const body = context.body as FormUpdateAPBDes;

  const id = context.params.id;

  if (!id) {
    return {
      success: false,
      message: "ID APB Des wajib diisi",
    };
  }

  try {
    const updated = await prisma.aPBDes.update({
      where: { id },
      data: {
        name: body.name,
        imageId: body.imageId,
        fileId: body.fileId,
        jumlah: body.jumlah,
      },
      include: {
        image: true,
      },
    });

    return {
      success: true,
      message: "APB Des berhasil diperbarui",
      data: updated,
    };
  } catch (error: any) {
    console.error("❌ Error update APB Des:", error);
    return {
      success: false,
      message: "Gagal memperbarui data APB Des",
      error: error.message,
    };
  }
}
