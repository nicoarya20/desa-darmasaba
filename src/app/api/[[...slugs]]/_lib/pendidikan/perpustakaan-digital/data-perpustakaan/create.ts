import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  judul: string;
  deskripsi: string;
  imageId: string;
  kategoriId: string;
}

export default async function dataPerpustakaanCreate(context: Context) {
  const body = (await context.body) as FormCreate;

  try {
    const result = await prisma.dataPerpustakaan.create({
      data: {
        judul: body.judul,
        deskripsi: body.deskripsi,
        imageId: body.imageId,
        kategoriId: body.kategoriId,
      },
    });
    return {
      success: true,
      message: "Berhasil membuat data perpustakaan",
      data: result,
    };
  } catch (error) {
    console.error("Error creating data perpustakaan:", error);
    throw new Error("Gagal membuat data perpustakaan: " + (error as Error).message);
  }
}