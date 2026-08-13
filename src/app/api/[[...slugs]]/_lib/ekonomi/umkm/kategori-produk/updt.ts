import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function kategoriProdukUpdate(context: Context) {
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
    const kategoriProduk = await prisma.kategoriProduk.update({
      where: { id },
      data: {
        nama: body.nama,
      },
    });

    return {
      success: true,
      message: "Success update kategori produk",
      data: kategoriProduk,
    };
  } catch (error) {
    console.error("Update error:", error);
    return {
      success: false,
      message: "Gagal update kategori produk",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}