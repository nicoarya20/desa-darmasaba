import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  nama: string;
  tanggal: string;
  jenisKelamin: string;
  alamat: string;
  penyebab: string;
};

export default async function kematianCreate(context: Context) {
  const body = context.body as FormCreate;

  const created = await prisma.kematian.create({
    data: {
      nama: body.nama,
      tanggal: new Date(body.tanggal),
      jenisKelamin: body.jenisKelamin,
      alamat: body.alamat,
      penyebab: body.penyebab,
    },
    select: {
      nama: true,
      tanggal: true,
      jenisKelamin: true,
      alamat: true,
      penyebab: true,
    },
  });
  return {
    success: true,
    message: "Sukses menambahkan kematian",
    data: created,
  };
}
