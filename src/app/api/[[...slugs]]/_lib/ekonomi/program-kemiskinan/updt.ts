import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
  nama: string;
  deskripsi: string;
  ikonUrl?: string;
  statistik?: {
    tahun: number;
    jumlah: number;
  };
};

export default async function programKemiskinanUpdate(context: Context) {
  const id = context.params.id as string;
  const body = context.body as FormUpdate;

  const program = await prisma.programKemiskinan.update({
    where: { id },
    data: {
      nama: body.nama,
      deskripsi: body.deskripsi,
      ikonUrl: body.ikonUrl,
      statistik: body.statistik
        ? {
            create: {
              tahun: Number(body.statistik.tahun),
              jumlah: Number(body.statistik.jumlah),
            },
          }
        : undefined,
    },
    include: {
      statistik: true,
    },
  });

  return {
    success: true,
    message: "Success update program kemiskinan",
    data: program,
  };
}
