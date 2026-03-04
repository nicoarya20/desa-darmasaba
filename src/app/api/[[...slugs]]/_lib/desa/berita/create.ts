import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  judul: string;
  deskripsi: string;
  content: string;
  kategoriBeritaId: string;
  imageId: string; // Featured image
  imageIds?: string[]; // Multiple images for gallery
  linkVideo?: string; // YouTube link
};

async function beritaCreate(context: Context) {
  const body = context.body as FormCreate;

  await prisma.berita.create({
    data: {
      content: body.content,
      deskripsi: body.deskripsi,
      imageId: body.imageId,
      judul: body.judul,
      kategoriBeritaId: body.kategoriBeritaId,
      // Connect multiple images if provided
      linkVideo: body.linkVideo,
      images: body.imageIds && body.imageIds.length > 0
      ? {
        connect: body.imageIds.map((id) => ({ id })),
      }
      : undefined,
    },
  });

  return {
    success: true,
    message: "Sukses menambahkan berita",
    data: {
      ...body,
    },
  };
}

export default beritaCreate

