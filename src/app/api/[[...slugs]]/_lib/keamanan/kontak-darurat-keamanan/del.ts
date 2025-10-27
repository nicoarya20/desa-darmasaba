import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function kontakDaruratKeamananDelete(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak diberikan");
  }

  await prisma.kontakDaruratToItem.deleteMany({
    where: {
      kontakDaruratId: id,
    },
  });

  const kontakDaruratKeamanan = await prisma.kontakDaruratKeamanan.findUnique({
    where: { id },
  });

  if (!kontakDaruratKeamanan) {
    return {
      status: 404,
      body: "Kontak darurat keamanan tidak ditemukan",
    };
  }

  await prisma.kontakDaruratKeamanan.delete({
    where: { id },
  });

  return {
    status: 200,
    success: true,
    message: "Kontak darurat keamanan berhasil dihapus",
  };
}
