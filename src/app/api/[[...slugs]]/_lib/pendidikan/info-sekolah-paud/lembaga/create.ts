import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  nama: string;
  jenjangId: string;
};

export default async function lembagaPendidikanCreate(context: Context) {
  const body = (await context.body) as FormCreate;

  if (!body.jenjangId) {
    throw new Error("jenjangId wajib diisi");
  }

  try {
    const result = await prisma.lembaga.create({
      data: {
        nama: body.nama,
        jenjangId: body.jenjangId,
      },
      include: {
        jenjangPendidikan: true,
        siswa: true,
        pengajar: true,
      },
    });

    return {
      success: true,
      message: "Berhasil membuat lembaga",
      data: result,
    };
  } catch (error) {
    console.error("Error creating lembaga:", error);
    throw new Error("Gagal membuat lembaga: " + (error as Error).message);
  }
}
