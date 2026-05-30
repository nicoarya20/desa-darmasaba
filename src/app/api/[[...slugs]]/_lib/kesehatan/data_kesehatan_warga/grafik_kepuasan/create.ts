import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  nama: string;
  tanggal: string;
  jenisKelamin: string;
  alamat: string;
  penyakit: string;
  banjarId?: string;
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
      ...(body.banjarId ? { banjarId: body.banjarId } : {}),
    },
    include: { banjar: { select: { id: true, name: true } } },
  });
  return {
    success: true,
    message: "Sukses menambahkan grafik kepuasan",
    data: created,
  };
}
