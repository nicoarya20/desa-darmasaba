import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
  nama: string;
  lembagaId: string;
};

export default async function siswaCreate(context: Context) {
  const body = (await context.body) as FormCreate;

  if (!body.lembagaId) {
    throw new Error("lembagaId wajib diisi");
  }

  try {
    const result = await prisma.siswa.create({
      data: {
        nama: body.nama,
        lembagaId: body.lembagaId,
      },
      include: {
        lembaga: true,
      },
    });

    return {
      success: true,
      message: "Berhasil menambahkan siswa",
      data: result,
    };
  } catch (error) {
    console.error("Error creating siswa:", error);
    throw new Error("Gagal membuat siswa: " + (error as Error).message);
  }
}
