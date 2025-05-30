import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.BeritaGetPayload<{
  select: {
    judul: true;
    deskripsi: true;
    content: true;
    kategoriBeritaId: true;
    imageId: true;
  };
}>;
async function beritaCreate(context: Context) {
  const body = context.body as FormCreate;

  await prisma.berita.create({
  data: {
      content: body.content,
      deskripsi: body.deskripsi,
      imageId: body.imageId,
      judul: body.judul,
      kategoriBeritaId: body.kategoriBeritaId,
    },
  });

  return {
    success: true,
    message: "Success create berita",
    data: {
      ...body,
    },
  };
}

export default beritaCreate

