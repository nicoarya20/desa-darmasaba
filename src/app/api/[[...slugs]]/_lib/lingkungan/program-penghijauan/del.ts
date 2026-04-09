/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function programPenghijauanDelete(context: Context) {
  const { id } = context.params as { id: string };

  if (!id) {
    return {
      success: false,
      message: "ID program penghijauan tidak ditemukan",
    };
  }

  try {
    const deleted = await prisma.programPenghijauan.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Program penghijauan berhasil dihapus",
      data: deleted,
    };
  } catch (error: any) {
    console.error("Error delete program penghijauan:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus program penghijauan",
      error: error.message,
    };
  }
}
