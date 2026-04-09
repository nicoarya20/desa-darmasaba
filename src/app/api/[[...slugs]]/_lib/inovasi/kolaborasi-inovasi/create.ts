import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import type { Prisma } from "@prisma/client";

// Define validation schema
type FormCreateKolaborasiInovasi = Prisma.KolaborasiInovasiGetPayload<{
  select: {
    name: true;
    tahun: true;
    slug: true;
    deskripsi: true;
    kolaborator: true;
  };
}>;

export default async function kolaborasiInovasiCreate(context: Context) {
  const body = context.body as FormCreateKolaborasiInovasi;

  // Create new kolaborasi inovasi
  await prisma.kolaborasiInovasi.create({
    data: {
      name: body.name,
      tahun: body.tahun,
      slug: body.slug,
      deskripsi: body.deskripsi,
      kolaborator: body.kolaborator,
    },
  });

  return {
    success: true,
    message: "Berhasil membuat kolaborasi inovasi",
    data: {
      ...body,
    },
  };
}
