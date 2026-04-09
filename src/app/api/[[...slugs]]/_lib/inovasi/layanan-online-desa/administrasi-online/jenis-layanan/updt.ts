import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function jenisLayananUpdate(context: Context) {
  const body = context.body as { nama: string, deskripsi: string };
  const id = context.params?.id as string;

  // Validasi ID dan nama
  if (!id) {
    return {
      success: false,
      message: "ID is required",
    };
  }

  if (!body.nama) {
    return {
      success: false,
      message: "Nama is required",
    };
  }

  try {
    const jenisLayanan = await prisma.jenisLayanan.update({
      where: { id },
      data: {
        nama: body.nama,
        deskripsi: body.deskripsi,
      },
    });

    return {
      success: true,
      message: "Success update jenis layanan",
      data: jenisLayanan,
    };
  } catch (error) {
    console.error("Update error:", error);
    return {
      success: false,
      message: "Gagal update jenis layanan",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
