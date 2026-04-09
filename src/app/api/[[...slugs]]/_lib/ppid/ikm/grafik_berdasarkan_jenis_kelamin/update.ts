import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function grafikBerdasarakanJenisKelaminUpdate(
  context: Context
) {
  const id = context.params?.id;

  if (!id) {
    return {
      success: false,
      message: "Id tidak ditemukan",
    }
  }

  const {perempuan, laki} = context.body as {
    perempuan: string;
    laki: string;
  }

  const existing = await prisma.grafikBerdasarkanJenisKelamin.findUnique({
    where: {
      id: id,
    },
  })

  if (!existing) {
    return {
      success: false,
      message: "Data tidak ditemukan",
    }
  }

  const updated = await prisma.grafikBerdasarkanJenisKelamin.update({
    where: {
      id
    },
    data: {
      perempuan: perempuan,
      laki: laki,
    },
  })

  return {
    success: true,
    message: "Data berhasil diupdate",
    data: updated,
  }
}
