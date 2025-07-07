/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function pegawaiDelete(context: Context) {
  const { id } = context.params as { id: string };

  if (!id) {
    return {
      success: false,
      message: "ID pegawai tidak ditemukan",
    };
  }

  try {
    const deleted = await prisma.pegawai.update({
      where: { id },
      data: {
        aktif: false, // soft delete
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Pegawai berhasil di-nonaktifkan",
      data: deleted,
    };
  } catch (error: any) {
    console.error("Error delete pegawai:", error);
    return {
      success: false,
      message: "Gagal menghapus pegawai",
      error: error.message,
    };
  }
}
