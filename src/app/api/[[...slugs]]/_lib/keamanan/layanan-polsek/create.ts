import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function layananPolsekCreate(context: Context) {
  const body = context.body as { nama: string };

  if (!body.nama) {
    return {
      success: false,
      message: "Nama is required",
    };
  }

  const layanan = await prisma.layananPolsek.create({
    data: {
      nama: body.nama,
      deletedAt: null, // pastikan ini ditambahkan kalau field-mu optional
    },
  });

  return {
    success: true,
    message: "Sukses menambahkan layanan polsek",
    data: layanan,
  };
}
