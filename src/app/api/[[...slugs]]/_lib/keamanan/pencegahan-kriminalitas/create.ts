import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.PencegahanKriminalitasGetPayload<{
  select: {
    judul: true;
    deskripsi: true;
    deskripsiSingkat: true;
    linkVideo: true;
  };
}>;

const pencegahanKriminalitasCreate = async (context: Context) => {
  const body = context.body as FormCreate;

  await prisma.pencegahanKriminalitas.create({
    data: {
      judul: body.judul,
      deskripsi: body.deskripsi,
      deskripsiSingkat: body.deskripsiSingkat,
      linkVideo: body.linkVideo,
    },
  });

  return {
    success: true,
    message: "Sukses menambahkan pencegahan kriminalitas",
    data: {
      ...body,
    },
    status: 200,
  };
};
export default pencegahanKriminalitasCreate;
