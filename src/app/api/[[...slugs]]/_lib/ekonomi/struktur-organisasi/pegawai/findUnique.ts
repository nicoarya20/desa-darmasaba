/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function pegawaiFindUnique(context: Context) {
  const { id } = context.params as { id: string };

  if (!id) {
    return {
      success: false,
      message: "ID pegawai diperlukan",
    };
  }

  try {
    const pegawai = await prisma.pegawai.findUnique({
      where: { id },
      include: {
        posisi: true,
        image: true
      },
    });

    if (!pegawai) {
      return {
        success: false,
        message: "Pegawai tidak ditemukan",
      };
    }

    return {
      success: true,
      data: pegawai,
    };
  } catch (error: any) {
    console.error("Error findUnique pegawai:", error);
    return {
      success: false,
      message: "Gagal mengambil data pegawai",
      error: error.message,
    };
  }
}
