import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function grafikBerdasarakanUmurUpdate(context: Context) {
  const id = context.params?.id;
  
  if (!id) {
    return {
      success: false,
      message: "Id tidak ditemukan",
    }
  }

  const {remaja, dewasa, orangtua, lansia} = context.body as {
    remaja: string;
    dewasa: string;
    orangtua: string;
    lansia: string;
  }

  const existing = await prisma.grafikBerdasarkanUmur.findUnique({
    where: {
      id: id
    }
  })

  if (!existing) {
    return {
      success: false,
      message: "Grafik tidak ditemukan"
    }
  }

  const updated = await prisma.grafikBerdasarkanUmur.update({
    where: {
      id: id
    },
    data: {
      remaja: remaja,
      dewasa: dewasa,
      orangtua: orangtua,
      lansia: lansia,
    },
  })

  return {
    success: true,
    message: "Data berhasil diupdate",
    data: updated,
  }
}
