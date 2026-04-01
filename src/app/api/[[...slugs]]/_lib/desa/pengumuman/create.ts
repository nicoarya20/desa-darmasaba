import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.PengumumanGetPayload<{
  select: {
    judul: true;
    deskripsi: true;
    content: true;
    categoryPengumumanId: true;
  };
}>;

export async function pengumumanCreate(context: Context) {
  const body = context.body as FormCreate;

  try {
    await prisma.pengumuman.create({
      data: {
        content: body.content,
        deskripsi: body.deskripsi,
        judul: body.judul,
        categoryPengumumanId: body.categoryPengumumanId,
      },
    });
  } catch (error) {
    console.error(error);
    console.error(body)
    return {
      success: false,
      message: "Failed create pengumuman",
      error: error,
    };
  }

  return {
    success: true,
    message: "Sukses menambahkan pengumuman",
    data: {
      ...body,
    },
  };
}
