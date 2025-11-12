import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  nama: string;
  tanggal: string;
  jenisKelamin: string;
  alamat: string;
  penyakit: string;
};

export default async function grafikKepuasanCreate(context: Context) {
  const body = context.body as FormCreate;

  const created = await prisma.grafikKepuasan.create({
    data: {
      nama: body.nama,
      tanggal: new Date(body.tanggal),
      jenisKelamin: body.jenisKelamin,
      alamat: body.alamat,
      penyakit: body.penyakit,
    },
    select: {
      nama: true,
      tanggal: true,
      jenisKelamin: true,
      alamat: true,
      penyakit: true,
    }
  });
  return {
    success: true,
    message: "Sukses menambahkan grafik kepuasan",
    data: created,
  };
}
