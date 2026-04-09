/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormUpdateProgramPenghijauan = {
  id: string;
  name?: string;
  judul?: string;
  deskripsi?: string;
  icon?: string;
};
export default async function programPenghijauanUpdate(context: Context) {
  const body = context.body as FormUpdateProgramPenghijauan;
  const id = context.params?.id; // ambil dari URL param

  if (!id) {
    return {
      success: false,
      message: "ID program penghijauan wajib diisi",
    };
  }

  try {
    const updated = await prisma.programPenghijauan.update({
      where: { id },
      data: {
        name: body.name,
        judul: body.judul,
        deskripsi: body.deskripsi,
        icon: body.icon,
      },
    });

    return {
      success: true,
      message: "Program penghijauan berhasil diupdate",
      data: updated,
    };
  } catch (error: any) {
    console.error("Error update program penghijauan:", error);
    return {
      success: false,
      message: "Gagal mengupdate program penghijauan",
      error: error.message,
    };
  }
}

