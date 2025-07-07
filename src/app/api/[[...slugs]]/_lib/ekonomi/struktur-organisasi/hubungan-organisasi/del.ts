/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function hubunganOrganisasiDelete(context: Context) {
  const { id } = context.params as { id: string };

  if (!id) {
    return {
      success: false,
      message: "ID wajib diisi",
    };
  }

  try {
    const deleted = await prisma.hubunganOrganisasi.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Hubungan organisasi berhasil dihapus",
      data: deleted,
    };
  } catch (error: any) {
    console.error("Error delete hubungan organisasi:", error);
    return {
      success: false,
      message: "Gagal menghapus hubungan organisasi",
      error: error.message,
    };
  }
}
