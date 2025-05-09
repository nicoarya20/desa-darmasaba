import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.IndeksKepuasanMasyarakatGetPayload<{
  select: {
    label: true;
    kepuasan: true;
  };
}>;
export default async function grafikHasilKepuasanMasyarakatCreate(context: Context) {
  const body = context.body as FormCreate;

  await prisma.indeksKepuasanMasyarakat.create({
    data: {
      label: body.label,
      kepuasan: body.kepuasan,
    },
  });
  return {
    success: true,
    message: "Success create grafik hasil kepuasan masyarakat",
    data: {
      ...body,
    },
  };
}
