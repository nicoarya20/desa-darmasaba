/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function dataLingkunganDesaDelete(context: Context) {
  const { id } = context.params as { id: string };

  if (!id) {
    return {
      success: false,
      message: "ID data lingkungan desa tidak ditemukan",
    };
  }

  try {
    const deleted = await prisma.dataLingkunganDesa.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Data lingkungan desa berhasil dihapus",
      data: deleted,
    };
  } catch (error: any) {
    console.error("Error delete data lingkungan desa:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus data lingkungan desa",
      error: error.message,
    };
  }
}
