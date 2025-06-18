import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function daftarInformasiPublikEdit(context: Context) {
  const id = context.params?.id;

  if (!id) {
    return {
      success: false,
      message: "ID tidak ditemukan",
    };
  }

  const { jenisInformasi, deskripsi, tanggal } = context.body as {
    jenisInformasi: string;
    deskripsi: string;
    tanggal: string;
  };

  const existing = await prisma.daftarInformasiPublik.findUnique({
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

  const updated = await prisma.daftarInformasiPublik.update({
    where: { id },
    data: {
      jenisInformasi,
      deskripsi,
      tanggal,
    },
  });

  return {
    success: true,
    message: "Data berhasil diupdate",
    data: updated,
  };
}
