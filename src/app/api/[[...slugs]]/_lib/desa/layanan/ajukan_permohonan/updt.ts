import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormUpdate = {
  id: string;
  nama: string;
  nik: string;
  alamat: string;
  nomorKk: string;
  kategoriId: string;
};

export default async function updateAjukanPermohonan(context: Context) {
  const id = context.params?.id;
  const body = context.body as FormUpdate;

  if (!id) {
    return {
      success: false,
      message: "ID tidak diberikan",
    };
  }

  const existing = await prisma.ajukanPermohonan.findUnique({
    where: { id },
    include: {
      kategori: true,
    },
  });

  if (!existing) {
    return {
      success: false,
      message: "Ajukan permohonan tidak ditemukan",
    };
  }

  const updated = await prisma.ajukanPermohonan.update({
    where: { id },
    data: body,
  });

  return {
    success: true,
    message: "Success update ajukan permohonan",
    data: updated,
  };
}
