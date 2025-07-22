/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdateProgramInovasi = {
  name?: string;
  description?: string;
  imageId?: string;
  link?: string;
};

export default async function programInovasiUpdate(context: Context) {
  const body = context.body as FormUpdateProgramInovasi;

  const id = context.params.id;

  if (!id) {
    return {
      success: false,
      message: "ID program inovasi wajib diisi",
    };
  }

  try {
    const updated = await prisma.programInovasi.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        imageId: body.imageId,
        link: body.link,
        updatedAt: new Date(),
      },
      include: {
        image: true,
      },
    });

    return {
      success: true,
      message: "Program inovasi berhasil diperbarui",
      data: updated,
    };
  } catch (error: any) {
    console.error("❌ Error update program inovasi:", error);
    return {
      success: false,
      message: "Gagal memperbarui data program inovasi",
      error: error.message,
    };
  }
}
