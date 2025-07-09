import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.SedangMencariKerjaGetPayload<{
  select: {
    count: true;
    percentageOfTotal: true;
    recordedDate: true;
  };
}>;

export default async function sedangMencariKerjaCreate(context: Context) {
  const body = context.body as FormCreate;

  const existing = await prisma.sedangMencariKerja.findFirst({
    where: {
      recordedDate: body.recordedDate,
    },
  });

  if (existing) {
    return {
      success: false,
      message: "Data sudah ada",
      data: null,
    };
  }

  const created = await prisma.sedangMencariKerja.create({
    data: {
      count: body.count,
      percentageOfTotal: body.percentageOfTotal,
      recordedDate: body.recordedDate,
    },
    select: {
      id: true,
      count: true,
      percentageOfTotal: true,
      recordedDate: true,
    },
  });

  return {
    success: true,
    message: "Berhasil menambahkan data sedang mencari kerja",
    data: created,
  };
}