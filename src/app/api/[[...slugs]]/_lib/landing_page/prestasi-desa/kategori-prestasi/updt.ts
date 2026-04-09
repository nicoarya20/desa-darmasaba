import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function kategoriPrestasiUpdate(context: Context) {
  const body = context.body as { name: string };
  const id = context.params?.id as string;

  // Validasi ID dan nama
  if (!id) {
    return {
      success: false,
      message: "ID is required",
    };
  }

  if (!body.name) {
    return {
      success: false,
      message: "Nama is required",
    };
  }

  try {
    const kategoriPrestasi = await prisma.kategoriPrestasiDesa.update({
      where: { id },
      data: {
        name: body.name,
      },
    });

    return {
      success: true,
      message: "Success update kategori prestasi",
      data: kategoriPrestasi,
    };
  } catch (error) {
    console.error("Update error:", error);
    return {
      success: false,
      message: "Gagal update kategori prestasi",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
