import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.IndeksKepuasanMasyarakatGetPayload<{
  select: {
    label: true;
    kepuasan: true;
  };
}>;
export default async function grafikHasilKepuasanMasyarakatCreate(context: Context) {
  const body = context.body as FormCreate;

  const created = await prisma.indeksKepuasanMasyarakat.create({
    data: {
      label: body.label,
      kepuasan: body.kepuasan,
    },
    select: {
      id: true,
      label: true,
      kepuasan: true,
    }
  });
  return {
    success: true,
    message: "Sukses menambahkan grafik hasil kepuasan masyarakat",
    data: created,
  };
}
