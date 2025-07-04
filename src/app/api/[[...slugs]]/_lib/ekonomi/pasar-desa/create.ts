import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  nama: string;
  harga: number;
  alamatUsaha: string;
  imageId: string;
  rating: number;
  kategoriId: string[]; // Array of KategoriProduk IDs
};

export default async function pasarDesaCreate(context: Context) {
  const body = context.body as FormCreate;

  if (!body.kategoriId || body.kategoriId.length === 0) {
    throw new Error("At least one kategoriId is required");
  }

  try {
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Create PasarDesa with the first kategoriId as the main category
      const pasarDesa = await prisma.pasarDesa.create({
        data: {
          nama: body.nama,
          harga: Number(body.harga),
          alamatUsaha: body.alamatUsaha,
          imageId: body.imageId,
          rating: Number(body.rating),
          kategoriProdukId: body.kategoriId[0], // Use the first category as the main one
        },
      });

      // 2. Create category relationships in KategoriToPasar for all categories
      await prisma.kategoriToPasar.createMany({
        data: body.kategoriId.map((kategoriId) => ({
          pasarDesaId: pasarDesa.id,
          kategoriId: kategoriId, // Note: The field is 'kategoriId' in the schema, not 'kategoriProdukId'
        })),
      });

      // 3. Get the complete data with relationships
      return await prisma.pasarDesa.findUnique({
        where: { id: pasarDesa.id },
        include: {
          image: true,
          kategoriProduk: true,
          KategoriToPasar: {
            include: {
              kategori: true,
            },
          },
        },
      });
    });

    return {
      success: true,
      message: "Success create pasar desa",
      data: result,
    };
  } catch (error) {
    console.error("Error creating PasarDesa:", error);
    throw new Error("Failed to create PasarDesa: " + (error as Error).message);
  }
}
