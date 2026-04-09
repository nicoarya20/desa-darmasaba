/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function pegawaiNonActive(context: Context) {
  const { id } = context.params as { id: string };

  if (!id) {
    return {
      success: false,
      message: "ID pegawai tidak ditemukan",
    };
  }

  try {
    const deleted = await prisma.pegawaiPPID.update({
      where: { id },
      data: {
        isActive: false, // soft delete
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Pegawai berhasil di-nonaktifkan",
      data: deleted,
    };
  } catch (error: any) {
    console.error("Error nonaktifkan pegawai:", error);
    return {
      success: false,
      message: "Gagal nonaktifkan pegawai",
      error: error.message,
    };
  }
}
