import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function programInovasiFindUnique(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const data = await prisma.programInovasi.findUnique({
    where: { id },
    include: {
      image: true,
    },
  });

  if (!data) {
    throw new Error("Program inovasi tidak ditemukan");
  }

  return {
    success: true,
    message: "Data program inovasi ditemukan",
    data,
  };
}
