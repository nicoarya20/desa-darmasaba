/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function hubunganOrganisasiFindUnique(context: Context) {
  const { id } = context.params as { id: string };

  if (!id) {
    return {
      success: false,
      message: "ID hubungan organisasi wajib diisi",
    };
  }

  try {
    const data = await prisma.hubunganOrganisasi.findUnique({
      where: { id },
      include: {
        atasan: true,
        bawahan: true,
      },
    });

    if (!data) {
      return {
        success: false,
        message: "Data hubungan organisasi tidak ditemukan",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error findUnique hubungan organisasi:", error);
    return {
      success: false,
      message: "Gagal mengambil data",
      error: error.message,
    };
  }
}
