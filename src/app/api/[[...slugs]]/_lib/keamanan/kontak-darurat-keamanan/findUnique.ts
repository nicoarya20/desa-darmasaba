import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function kontakDaruratKeamananFindUnique(
  context: Context
) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

    const data = await prisma.kontakDaruratKeamanan.findUnique({
      where: { id },
      include: {
        kontakItems: {
          include: {
            kontakItem: {
              include: {
                image: true
              }
            },
            
          },
        },
        image: true,
      },
    });

    if (!data) {
      throw new Error("Pasar desa tidak ditemukan");
    }
  
    return {
      success: true,
      message: "Data kontak darurat keamanan ditemukan",
      data,
    };
}
