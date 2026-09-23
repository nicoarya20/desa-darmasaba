import { Context } from "elysia";
import prisma from "@/lib/prisma";

type FormCreate = {
  judul: string;
  artis: string;
  deskripsi?: string;
  durasi: string;
  audioFileId: string;
  coverImageId: string;
  genre?: string;
  tahunRilis?: number | null;
};

async function musikCreate(context: Context) {
  const body = context.body as FormCreate;

  const result = await prisma.musikDesa.create({
    data: {
      judul: body.judul,
      artis: body.artis,
      deskripsi: body.deskripsi,
      durasi: body.durasi,
      audioFileId: body.audioFileId,
      coverImageId: body.coverImageId,
      genre: body.genre,
      tahunRilis: body.tahunRilis,
    },
  });

  return {
    success: true,
    message: "Sukses menambahkan musik",
    data: result,
  };
}

export default musikCreate;
