import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

export default async function mitraKolaborasiDelete(context: Context) {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const mitraKolaborasi = await prisma.mitraKolaborasi.findUnique({
    where: { id },
    include: {
      image: true,
    },
  });

  if (!mitraKolaborasi) {
    return {
      status: 404,
      body: "Mitra kolaborasi tidak ditemukan",
    };
  }

  await prisma.mitraKolaborasi.delete({
    where: { id },
  });

  if (mitraKolaborasi.image) {
    await removeStoredFile(mitraKolaborasi.image, "MitraKolaborasi");
  }

  return {
    success: true,
    message: "Mitra kolaborasi berhasil dihapus",
    status: 200,
  };
}
