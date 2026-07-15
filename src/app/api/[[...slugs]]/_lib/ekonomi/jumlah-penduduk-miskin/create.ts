import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-error";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.GrafikJumlahPendudukMiskinGetPayload<{
  select: {
    year: true;
    totalPoorPopulation: true;
  };
}>;
export default async function grafikJumlahPendudukMiskinCreate(
  context: Context
) {
  const body = context.body as FormCreate;

  try {
    const created = await prisma.grafikJumlahPendudukMiskin.create({
      data: {
        year: body.year,
        totalPoorPopulation: body.totalPoorPopulation,
      },
      select: {
        id: true,
        year: true,
        totalPoorPopulation: true,
      },
    });

    return {
      success: true,
      message: "Sukses menambahkan grafik jumlah penduduk miskin",
      data: created,
    };
  } catch (error) {
    // Tahun data unik (@unique) → 409 "Tahun sudah dipakai"; error lain di-throw
    return handlePrismaError(error, context);
  }
}
