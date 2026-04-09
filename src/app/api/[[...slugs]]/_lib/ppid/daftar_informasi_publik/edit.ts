import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormEdit = {
  jenisInformasi: string;
  deskripsi: string;
  tanggal: string;
};

export default async function daftarInformasiPublikEdit(context: Context) {
  const id = context.params?.id;

  if (!id) {
    return {
      success: false,
      message: "ID tidak ditemukan",
    };
  }

  const body = context.body as FormEdit;

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
      jenisInformasi: body.jenisInformasi,
      deskripsi: body.deskripsi,
      tanggal: new Date(body.tanggal),
    },
  });

  return {
    success: true,
    message: "Data berhasil diupdate",
    data: updated,
  };
}
