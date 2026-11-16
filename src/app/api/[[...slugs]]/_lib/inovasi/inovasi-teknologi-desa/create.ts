import prisma from "@/lib/prisma";
import { INOVASI_KATEGORI_DEFAULT, type InovasiKategori } from "@/lib/inovasi-teknologi/kategori";
import { Context } from "elysia";

type FormCreate = {
  name: string;
  deskripsi: string;
  imageId: string;
  /** Opsional; tanpa field ini → kategori bawaan (sudah divalidasi skema body di index.ts). */
  kategori?: InovasiKategori;
};

/** Tambah satu entri Inovasi Teknologi Desa. */
export default async function inovasiTeknologiCreate(context: Context) {
  const body = context.body as FormCreate;

  const result = await prisma.inovasiTeknologiDesa.create({
    data: {
      name: body.name,
      deskripsi: body.deskripsi,
      kategori: body.kategori ?? INOVASI_KATEGORI_DEFAULT,
      imageId: body.imageId,
    },
  });

  return {
    success: true,
    message: "Sukses menambahkan inovasi teknologi desa",
    data: result,
  };
}
