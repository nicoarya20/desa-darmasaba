import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  judul: string;
  deskripsi: string;
  content: string;
  imageId: string; // Featured image
  imageIds?: string[]; // Multiple images for gallery
  linkVideo?: string; // YouTube link
};

async function kesejahteraanCreate(context: Context) {
  const body = context.body as FormCreate;

  await prisma.kesejahteraanMasyarakat.create({
    data: {
      content: body.content,
      deskripsi: body.deskripsi,
      imageId: body.imageId,
      judul: body.judul,
      linkVideo: body.linkVideo,
      images:
        body.imageIds && body.imageIds.length > 0
          ? {
              connect: body.imageIds.map((id) => ({ id })),
            }
          : undefined,
    },
  });

  return {
    success: true,
    message: "Sukses menambahkan program kesejahteraan masyarakat",
    data: {
      ...body,
    },
  };
}

export default kesejahteraanCreate;
