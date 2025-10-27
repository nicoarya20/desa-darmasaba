/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function programKreatifDelete(context: Context) {
  const { id } = context.params as { id: string };

  if (!id) {
    return {
      success: false,
      message: "ID program kreatif tidak ditemukan",
    };
  }

  try {
    const deleted = await prisma.programKreatif.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Program kreatif berhasil dihapus",
      data: deleted,
    };
  } catch (error: any) {
    console.error("Error delete program kreatif:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus program kreatif",
      error: error.message,
    };
  }
}
