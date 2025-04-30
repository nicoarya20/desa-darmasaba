import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.SyaratKetentuanJadwalKegiatanGetPayload<{
  select: {
    content: true;
  };
}>;

export default async function SyaratKetentuanCreate(context: Context) {
  const body = context.body as FormCreate;

  await prisma.syaratKetentuanJadwalKegiatan.create({
    data: {
      content: body.content,
    },
  });
  return {
    success: true,
    message: "Success create syarat ketentuan jadwal kegiatan",
    data: {
      ...body,
    },
  };
}
