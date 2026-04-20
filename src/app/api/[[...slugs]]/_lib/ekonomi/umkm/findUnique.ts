import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function umkmFindUnique(context: Context) {
  const id = context.params.id;

  try {
    const data = await prisma.umkm.findUnique({
      where: { id },
      include: {
        image: true,
        kategori: true,
        produk: {
          where: { deletedAt: null },
          include: { image: true }
        }
      },
    });

    if (!data) {
      return {
        success: false,
        message: "UMKM tidak ditemukan",
      };
    }

    return {
      success: true,
      message: "Berhasil mengambil detail UMKM",
      data,
    };
  } catch (e) {
    console.error("Error di umkmFindUnique:", e);
    return {
      success: false,
      message: "Gagal mengambil detail UMKM",
    };
  }
}

export default umkmFindUnique;
