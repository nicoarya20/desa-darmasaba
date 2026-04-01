import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

export default async function grafikRespondenCreate(context: Context) {
  const body = context.body as Prisma.GrafikBerdasarkanRespondenCreateInput;

  const created = await prisma.grafikBerdasarkanResponden.create({
    data: body,
  });

  return {
    success: true,
    message: "Sukses menambahkan grafik berdasarkan responden",
    data: created, // ini termasuk id
  };
}
