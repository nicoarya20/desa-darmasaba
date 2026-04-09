import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function jenisPengaduanUpdate(context: Context) {
  const body = context.body as { nama: string };
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
    const jenisPengaduan = await prisma.jenisPengaduan.update({
      where: { id },
      data: {
        nama: body.nama,
      },
    });

    return {
      success: true,
      message: "Success update jenis pengaduan",
      data: jenisPengaduan,
    };
  } catch (error) {
    console.error("Update error:", error);
    return {
      success: false,
      message: "Gagal update jenis pengaduan",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
