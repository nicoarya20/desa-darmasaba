/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function kegiatanDesaCreate(context: Context) {
  const body = context.body as any;

  try {
    const data = await prisma.kegiatanDesa.create({
      data: {
        judul: body.judul,
        deskripsiSingkat: body.deskripsiSingkat,
        deskripsiLengkap: body.deskripsiLengkap,
        tanggal: new Date(body.tanggal),
        lokasi: body.lokasi,
        partisipan: Number(body.partisipan) || 0,
        kategoriKegiatanId: body.kategoriKegiatanId,
        imageId: body.imageId || null,
      },
      include: { kategoriKegiatan: true, image: true },
    });

    return { success: true, message: "Kegiatan desa berhasil dibuat", data };
  } catch (e) {
    console.error("Error di kegiatanDesaCreate:", e);
    return { success: false, message: "Gagal membuat kegiatan desa" };
  }
}

export default kegiatanDesaCreate;
