import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

export default async function desaDigitalDelete(context: Context) {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const desaDigital = await prisma.desaDigital.findUnique({
    where: { id },
    include: {
      image: true,
    },
  });

  if (!desaDigital) {
    return {
      status: 404,
      body: "Desa digital tidak ditemukan",
    };
  }

  await prisma.desaDigital.delete({
    where: { id },
  });

  if (desaDigital.image) {
    await removeStoredFile(desaDigital.image, "DesaDigital");
  }

  return {
    success: true,
    message: "Desa digital berhasil dihapus",
    status: 200,
  };
}
