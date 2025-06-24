import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function dokterDantenagamedisUpdate(context: Context) {
  const id = context.params?.id;

  if (!id) {
    return {
      success: false,
      message: "ID tidak ditemukan",
    };
  }

  const { nama, spesialis, jadwal } = context.body as {
    nama: string;
    spesialis: string;
    jadwal: string;
  };

  const existing = await prisma.dokterdanTenagaMedis.findUnique({
    where: {
      id: id,
    },
  });

  if (!existing) {
    return {
      success: false,
      message: "Data tidak ditemukan",
    };
  }

  const updated = await prisma.dokterdanTenagaMedis.update({
    where: { id },
    data: {
      name: nama,
      specialist: spesialis,
      jadwal,
    },
  });

  return {
    success: true,
    message: "Data berhasil diupdate",
    data: updated,
  };
}
