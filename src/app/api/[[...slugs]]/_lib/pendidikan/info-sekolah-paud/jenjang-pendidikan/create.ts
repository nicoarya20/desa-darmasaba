import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
  nama: string;
};

export default async function jenjangPendidikanCreate(context: Context) {
  const body = (await context.body) as FormCreate;

  try {
    const result = await prisma.jenjangPendidikan.create({
      data: {
        nama: body.nama,
      },
    });

    return {
      success: true,
      message: "Berhasil membuat jenjang pendidikan",
      data: result,
    };
  } catch (error) {
    console.error("Error creating jenjang pendidikan:", error);
    throw new Error("Gagal membuat jenjang pendidikan: " + (error as Error).message);
  }
}
