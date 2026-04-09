import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function ajukanIdeInovatifDelete(context: Context) {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const ajukanIdeInovatif = await prisma.ajukanIdeInovatif.findUnique({
    where: { id },
  });

  if (!ajukanIdeInovatif) {
    return {
      status: 404,
      body: "Ajukan ide inovatif tidak ditemukan",
    };
  }

  await prisma.ajukanIdeInovatif.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Ajukan ide inovatif berhasil dihapus",
    status: 200,
  };
}
