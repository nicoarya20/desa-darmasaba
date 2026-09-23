import prisma from "@/lib/prisma";
import { toForeignKeyResponse } from "@/lib/prisma-error";
import { Context } from "elysia";

async function umkmCreate(context: Context) {
  const body = context.body as any;

  try {
    const data = await prisma.umkm.create({
      data: {
        nama: body.nama,
        pemilik: body.pemilik,
        deskripsi: body.deskripsi,
        alamat: body.alamat,
        kontak: body.kontak,
        imageId: body.imageId,
        kategoriId: body.kategoriId,
        isActive: body.isActive ?? true,
      },
    });

    return {
      success: true,
      message: "Berhasil membuat UMKM baru",
      data,
    };
  } catch (e) {
    const fkError = toForeignKeyResponse(e);
    if (fkError) {
      context.set.status = 422;
      return fkError;
    }
    console.error("Error di umkmCreate:", e);
    return {
      success: false,
      message: "Gagal membuat UMKM baru",
    };
  }
}

export default umkmCreate;
