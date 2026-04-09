import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
  layanan: string;
  tarif: string;
};

export default async function tarifLayananCreate(context: Context) {
  const body = context.body as FormCreate;

  const created = await prisma.tarifDanLayanan.create({
    data: {
      layanan: body.layanan,
      tarif: body.tarif,
    },
    select: {
      layanan: true,
      tarif: true,
    }
  });

  return {
    success: true,
    message: "Sukses menambahkan dokter tenaga medis",
    data: created,
  };
}