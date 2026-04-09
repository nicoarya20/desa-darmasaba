/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormUpdateDataLingkunganDesa = {
  id: string;
  name?: string;
  jumlah?: string;
  deskripsi?: string;
  icon?: string;
};
export default async function dataLingkunganDesaUpdate(context: Context) {
  const body = context.body as FormUpdateDataLingkunganDesa;
  const id = context.params?.id; // ambil dari URL param

  if (!id) {
    return {
      success: false,
      message: "ID data lingkungan desa wajib diisi",
    };
  }

  try {
    const updated = await prisma.dataLingkunganDesa.update({
      where: { id },
      data: {
        name: body.name,
        jumlah: body.jumlah,
        deskripsi: body.deskripsi,
        icon: body.icon,
      },
    });

    return {
      success: true,
      message: "Data lingkungan desa berhasil diupdate",
      data: updated,
    };
  } catch (error: any) {
    console.error("Error update data lingkungan desa:", error);
    return {
      success: false,
      message: "Gagal mengupdate data lingkungan desa",
      error: error.message,
    };
  }
}

