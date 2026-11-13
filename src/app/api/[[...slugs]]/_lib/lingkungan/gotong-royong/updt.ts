/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeReleasedFiles from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";

type FormUpdateKegiatanDesa = {
  judul?: string;
  deskripsiSingkat?: string;
  deskripsiLengkap?: string;
  tanggal?: string;
  lokasi?: string;
  partisipan?: number;
  imageId?: string;
  kategoriKegiatanId?: string; // minimal satu kategori
};

export default async function kegiatanDesaUpdate(context: Context) {
  const body = context.body as FormUpdateKegiatanDesa;

  const id = context.params.id;

  if (!id) {
    return {
      success: false,
      message: "ID kegiatan desa wajib diisi",
    };
  }

  try {
    const before = await prisma.kegiatanDesa.findUnique({ where: { id }, select: { imageId: true } });
    const updated = await prisma.kegiatanDesa.update({
      where: { id },
      data: {
        judul: body.judul,
        deskripsiSingkat: body.deskripsiSingkat,
        deskripsiLengkap: body.deskripsiLengkap,
        tanggal: body.tanggal ? new Date(body.tanggal) : undefined,
        lokasi: body.lokasi,
        partisipan: body.partisipan ?? 0,
        imageId: body.imageId,
        updatedAt: new Date(),
      },
      include: {
        image: true,
        kategoriKegiatan: true,
      },
    });
    await removeReleasedFiles("KegiatanDesa", [before?.imageId], [updated.imageId]);

    return {
      success: true,
      message: "Kegiatan desa berhasil diperbarui",
      data: updated,
    };
  } catch (error: any) {
    console.error("❌ Error update kegiatan desa:", error);
    return {
      success: false,
      message: "Gagal memperbarui data kegiatan desa",
      error: error.message,
    };
  }
}
