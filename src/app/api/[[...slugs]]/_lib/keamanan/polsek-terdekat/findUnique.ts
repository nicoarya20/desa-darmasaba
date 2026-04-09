import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function polsekTerdekatFindUnique(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const data = await prisma.polsekTerdekat.findUnique({
    where: { id },
    include: {
      LayananToPolsek: {
        include: {
          layanan: true
        },
      },
    },
  });

  if (!data) {
    throw new Error("Polsek terdekat tidak ditemukan");
  }

  return {
    success: true,
    message: "Data polsek terdekat ditemukan",
    data,
  };
}
