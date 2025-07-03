import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  nama: string;
  harga: number;
  alamatUsaha: string;
  imageId: string;
  rating: number;
  kategoriId: string[]; // Array of KategoriMakanan IDs
};
export default async function pasarDesaCreate(context: Context) {
  const body = context.body as FormCreate;

  // First, create the PasarDesa record
  const pasarDesa = await prisma.pasarDesa.create({
    data: {
      nama: body.nama,
      harga: Number(body.harga),
      alamatUsaha: body.alamatUsaha,
      imageId: body.imageId,
      rating: Number(body.rating),
      kategori: {
        connect: body.kategoriId.map((id) => ({ id })),
      },
    },
    include: {
      image: true,
      kategori: true,
    },
  });

    return {
      success: true,
      message: "Success create pasar desa",
      data: pasarDesa,
    };
}
