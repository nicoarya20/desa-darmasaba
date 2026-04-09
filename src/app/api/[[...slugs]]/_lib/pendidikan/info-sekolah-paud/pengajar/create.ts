import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
  nama: string;
  lembagaId: string;
};

export default async function pengajarCreate(context: Context) {
  const body = (await context.body) as FormCreate;

  if (!body.lembagaId) {
    throw new Error("lembagaId wajib diisi");
  }

  try {
    const result = await prisma.pengajar.create({
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
      message: "Berhasil menambahkan pengajar",
      data: result,
    };
  } catch (error) {
    console.error("Error creating pengajar:", error);
    throw new Error("Gagal membuat pengajar: " + (error as Error).message);
  }
}
