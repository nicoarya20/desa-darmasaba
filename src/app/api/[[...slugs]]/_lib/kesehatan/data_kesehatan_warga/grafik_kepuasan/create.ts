import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.GrafikKepuasanGetPayload<{
  select: {
    label: true;
    jumlah: true
  };
}>;
export default async function grafikKepuasanCreate(context: Context) {
  const body = context.body as FormCreate;

  const created = await prisma.grafikKepuasan.create({
    data: {
      label: body.label,
      jumlah: body.jumlah,
    },
    select: {
      uuid: true,
      label: true,
      jumlah: true,
    }
  });
  return {
    success: true,
    message: "Success create grafik kepuasan",
    data: created,
  };
}
