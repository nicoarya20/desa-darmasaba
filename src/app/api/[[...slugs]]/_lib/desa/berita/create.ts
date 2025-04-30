import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.BeritaGetPayload<{
  select: {
    judul: true;
    deskripsi: true;
    image: true;
    content: true;
    katagoryBeritaId: true;
  };
}>;
async function beritaCreate(context: Context) {
  const body = context.body as FormCreate;

//   console.log(body)

  await prisma.berita.create({
  data: {
      content: body.content,
      deskripsi: body.deskripsi,
      image: body.image,
      judul: body.judul,
      katagoryBeritaId: body.katagoryBeritaId,
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

