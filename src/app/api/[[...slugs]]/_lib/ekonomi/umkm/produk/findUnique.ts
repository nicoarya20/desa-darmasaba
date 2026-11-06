import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { LINK_TOKO_INCLUDE, sembunyikanLinkBilaDihapus } from "./_link";

async function produkUmkmFindUnique(context: Context) {
  const id = context.params.id;

  try {
    const data = await prisma.pasarDesa.findUnique({
      where: { id },
      include: {
        image: true,
        umkm: true,
        penjualan: {
          where: { deletedAt: null },
          orderBy: { tanggal: 'desc' },
          take: 10
        },
        kategoriProduk: true,
        linkTokoOnline: LINK_TOKO_INCLUDE,
      },
    });

    if (!data) {
      return {
        success: false,
        message: "Produk UMKM tidak ditemukan",
      };
    }

    return {
      success: true,
      message: "Berhasil mengambil detail produk UMKM (PasarDesa)",
      data: sembunyikanLinkBilaDihapus(data),
    };
  } catch (e) {
    console.error("Error di produkUmkmFindUnique:", e);
    return {
      success: false,
      message: "Gagal mengambil detail produk UMKM",
    };
  }
}

export default produkUmkmFindUnique;
