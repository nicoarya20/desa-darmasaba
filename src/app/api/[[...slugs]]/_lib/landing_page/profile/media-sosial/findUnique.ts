import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function mediaSosialFindUnique(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const data = await prisma.mediaSosial.findUnique({
    where: { id },
    include: {
      image: true,
    },
  });

  if (!data) {
    throw new Error("Media sosial tidak ditemukan");
  }

  return {
    success: true,
    message: "Data media sosial ditemukan",
    data,
  };
}
