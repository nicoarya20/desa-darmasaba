import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  nama: string;
  imageId?: string;
  kategoriId: string[];
};
export default async function kontakDaruratKeamananCreate(context: Context) {
  const body = context.body as FormCreate;

  if (!body.kategoriId || body.kategoriId.length === 0) {
    throw new Error("At least one kategoriId is required");
  }

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const kontakDaruratKeamanan = await prisma.kontakDaruratKeamanan.create({
        data: {
          nama: body.nama,
          imageId: body.imageId,
          kategoriId: body.kategoriId[0],
        },
      });

      await prisma.kontakDaruratToItem.createMany({
        data: body.kategoriId.map((kategoriId) => ({
          kontakDaruratId: kontakDaruratKeamanan.id,
          kontakItemId: kategoriId,
        })),
      });

      return await prisma.kontakDaruratKeamanan.findUnique({
        where: { id: kontakDaruratKeamanan.id },
        include: {
          image: true,
          kategori: true,
          kontakItems: {
            include: {
              kontakItem: true,
            },
          },
        },
      });
    });

    return {
      success: true,
      message: "Success create kontak darurat keamanan",
      data: result,
    };
  } catch (error) {
    console.error("Error creating KontakDaruratKeamanan:", error);
    throw new Error("Failed to create KontakDaruratKeamanan: " + (error as Error).message);
  }
}
