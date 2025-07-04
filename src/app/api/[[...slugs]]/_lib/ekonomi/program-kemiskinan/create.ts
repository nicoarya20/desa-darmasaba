import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  nama: string;
  deskripsi: string;
  ikonUrl?: string; // optional karena boleh null
  statistik?: {
    tahun: number;
    jumlah: number;
  };
};

export default async function programKemiskinanCreate(context: Context) {
  const body = context.body as FormCreate;

  const program = await prisma.programKemiskinan.create({
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
      statistik: true, // untuk menampilkan data relasinya juga
    },
  });

  return {
    success: true,
    message: "Success create program kemiskinan dengan relasi statistik",
    data: program,
  };
}
