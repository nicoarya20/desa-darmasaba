import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.GrafikBerdasarkanRespondenGetPayload<{
  select: {
    sangatbaik: true;
    baik: true;
    kurangbaik: true;
    tidakbaik: true
  };
}>;
export default async function grafikRespondenCreate(context: Context) {
  const body = context.body as FormCreate;

  await prisma.grafikBerdasarkanResponden.create({
    data: {
      sangatbaik: body.sangatbaik,
      baik: body.baik,
      kurangbaik: body.kurangbaik,
      tidakbaik: body.tidakbaik,
    },
  });
  return {
    success: true,
    message: "Success create grafik berdasarkan responden",
    data: {
      ...body,
    },
  };
}