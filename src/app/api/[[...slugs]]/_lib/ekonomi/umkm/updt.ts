import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function umkmUpdate(context: Context) {
  const body = context.body as any;
  const id = context.params.id;

  try {
    const data = await prisma.umkm.update({
      where: { id },
      data: {
        nama: body.nama,
        pemilik: body.pemilik,
        deskripsi: body.deskripsi,
        alamat: body.alamat,
        kontak: body.kontak,
        imageId: body.imageId,
        kategoriId: body.kategoriId,
        isActive: body.isActive,
      },
    });

    return {
      success: true,
      message: "Berhasil memperbarui data UMKM",
      data,
    };
  } catch (e) {
    console.error("Error di umkmUpdate:", e);
    return {
      success: false,
      message: "Gagal memperbarui data UMKM",
    };
  }
}

export default umkmUpdate;
