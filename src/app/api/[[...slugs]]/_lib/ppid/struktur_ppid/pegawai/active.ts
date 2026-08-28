/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function pegawaiActive(context: Context) {
  const { id } = context.params as { id: string };

  if (!id) {
    return {
      success: false,
      message: "ID pegawai tidak ditemukan",
    };
  }

  try {
    const updated = await prisma.pegawaiPPID.update({
      where: { id },
      data: {
        isActive: true, // aktifkan kembali
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Pegawai berhasil diaktifkan",
      data: updated,
    };
  } catch (error: any) {
    console.error("Error aktifkan pegawai:", error);
    return {
      success: false,
      message: "Gagal mengaktifkan pegawai",
      error: error.message,
    };
  }
}
