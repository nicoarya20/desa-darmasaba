import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
  name: string;
  deskripsi: string;
  imageId: string;
  kategoriId: string;
};

export default async function prestasiDesaCreate(context: Context) {
  const body = context.body as FormCreate;

  try {
    const result = await prisma.prestasiDesa.create({
      data: {
        name: body.name,
        deskripsi: body.deskripsi,
        imageId: body.imageId,
        kategoriId: body.kategoriId,
      },
      include: {
        image: true,
        kategori: true,
      },
    });
    return {
      success: true,
      message: "Berhasil membuat Prestasi Desa",
      data: result,
    };
  } catch (error) {
    console.error("Error creating Prestasi Desa:", error);
    throw new Error(
      "Gagal membuat Prestasi Desa: " + (error as Error).message
    );
  }
}