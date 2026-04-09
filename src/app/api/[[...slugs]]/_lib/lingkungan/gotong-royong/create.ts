import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
  judul: string;
  deskripsiSingkat: string;
  deskripsiLengkap: string;
  tanggal: string;
  lokasi: string;
  partisipan?: number;
  imageId: string;
  kategoriKegiatanId: string; // minimal satu kategori
};

export default async function kegiatanDesaCreate(context: Context) {
  const body = context.body as FormCreate;

  if (!body.kategoriKegiatanId) {
    throw new Error("kategoriKegiatanId wajib diisi");
  }

  try {
    // Create langsung data AdministrasiOnline
    const result = await prisma.kegiatanDesa.create({
      data: {
        judul: body.judul,
        deskripsiSingkat: body.deskripsiSingkat,
        deskripsiLengkap: body.deskripsiLengkap,
        tanggal: body.tanggal,
        lokasi: body.lokasi,
        partisipan: body.partisipan ?? 0,
        imageId: body.imageId,
        kategoriKegiatanId: body.kategoriKegiatanId, // relasi ke JenisLayanan
      },
      include: {
        kategoriKegiatan: true, // Include data relasi
      },
    });

    return {
      success: true,
      message: "Berhasil membuat kegiatan desa",
      data: result,
    };
  } catch (error) {
    console.error("Error creating kegiatan desa:", error);
    throw new Error(
      "Gagal membuat kegiatan desa: " + (error as Error).message
    );
  }
}
