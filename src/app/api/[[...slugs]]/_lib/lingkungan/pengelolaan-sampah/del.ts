/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function pengelolaanSampahDelete(context: Context) {
  const { id } = context.params as { id: string };

  if (!id) {
    return {
      success: false,
      message: "ID pengelolaan sampah tidak ditemukan",
    };
  }

  try {
    const deleted = await prisma.pengelolaanSampah.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Pengelolaan sampah berhasil dihapus",
      data: deleted,
    };
  } catch (error: any) {
    console.error("Error delete pengelolaan sampah:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus pengelolaan sampah",
      error: error.message,
    };
  }
}
