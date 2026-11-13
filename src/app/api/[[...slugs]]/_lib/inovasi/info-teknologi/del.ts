import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

export default async function infoTeknoDelete(context: Context) {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const infoTekno = await prisma.infoTekno.findUnique({
    where: { id },
    include: {
      image: true,
    },
  });

  if (!infoTekno) {
    return {
      status: 404,
      body: "Info teknologi tidak ditemukan",
    };
  }

  await prisma.infoTekno.delete({
    where: { id },
  });

  if (infoTekno.image) {
    await removeStoredFile(infoTekno.image, "InfoTekno");
  }

  return {
    success: true,
    message: "Info teknologi berhasil dihapus",
    status: 200,
  };
}
