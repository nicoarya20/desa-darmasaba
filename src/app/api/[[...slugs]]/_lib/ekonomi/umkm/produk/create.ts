import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function produkUmkmCreate(context: Context) {
  const body = context.body as any;

  try {
    const data = await prisma.pasarDesa.create({
      data: {
        nama: body.nama,
        harga: body.harga,
        stok: body.stok ?? 0,
        satuan: body.satuan || null,
        deskripsi: body.deskripsi,
        umkmId: body.umkmId,
        imageId: body.imageId,
        isActive: body.isActive ?? true,
        rating: 0, // Default for UMKM products
        kategoriProdukId: body.kategoriId, // Now required via PasarDesa
      },
    });

    return {
      success: true,
      message: "Berhasil membuat produk UMKM baru (PasarDesa)",
      data,
    };
  } catch (e) {
    console.error("Error di produkUmkmCreate:", e);
    return {
      success: false,
      message: "Gagal membuat produk UMKM baru",
    };
  }
}

export default produkUmkmCreate;
