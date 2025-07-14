/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdateProgramKreatif = {
  id: string;
  name?: string;
  slug?: string;
  deskripsi?: string;
  icon?: string;
};
export default async function programKreatifUpdate(context: Context) {
  const body = context.body as FormUpdateProgramKreatif;
  const id = context.params?.id; // ambil dari URL param

  if (!id) {
    return {
      success: false,
      message: "ID program kreatif wajib diisi",
    };
  }

  try {
    const updated = await prisma.programKreatif.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        deskripsi: body.deskripsi,
        icon: body.icon,
      },
    });

    return {
      success: true,
      message: "Program kreatif berhasil diupdate",
      data: updated,
    };
  } catch (error: any) {
    console.error("Error update program kreatif:", error);
    return {
      success: false,
      message: "Gagal mengupdate program kreatif",
      error: error.message,
    };
  }
}

