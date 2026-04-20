import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function produkUmkmUpdate(context: Context) {
  const body = context.body as any;
  const id = context.params.id;

  try {
    const data = await prisma.produkUmkm.update({
      where: { id },
      data: {
        nama: body.nama,
        harga: body.harga,
        stok: body.stok,
        deskripsi: body.deskripsi,
        umkmId: body.umkmId,
        imageId: body.imageId,
        isActive: body.isActive,
      },
    });

    return {
      success: true,
      message: "Berhasil memperbarui produk UMKM",
      data,
    };
  } catch (e) {
    console.error("Error di produkUmkmUpdate:", e);
    return {
      success: false,
      message: "Gagal memperbarui produk UMKM",
    };
  }
}

export default produkUmkmUpdate;
