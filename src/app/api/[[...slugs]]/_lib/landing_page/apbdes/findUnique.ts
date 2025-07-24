import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function apbdesFindUnique(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const data = await prisma.aPBDes.findUnique({
    where: { id },
    include: {
      image: true,
      file: true,
    },
  });

  if (!data) {
    throw new Error("APB Des tidak ditemukan");
  }

  return {
    success: true,
    message: "Data APB Des ditemukan",
    data,
  };
}
