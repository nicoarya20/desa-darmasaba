/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function pegawaiDelete(context: Context) {
  const { id } = context.params as { id: string };

  if (!id) {
    return {
      success: false,
      message: "ID pegawai tidak ditemukan",
    };
  }

  try {
    const deleted = await prisma.pegawaiBumDes.delete({
      where: { id },  
    });

    return {
      success: true,
      message: "Pegawai berhasil dihapus",
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
