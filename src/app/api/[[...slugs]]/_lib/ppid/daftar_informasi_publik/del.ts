import prisma from "@/lib/prisma";
import type { Context } from "elysia";

const daftarInformasiPublikDelete = async (context: Context) => {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const daftarInformasi = await prisma.daftarInformasiPublik.findUnique({
    where: { id },
  });

  if (!daftarInformasi) {
    return {
      status: 400,
      body: "Daftar Informasi Publik tidak ditemukan",
    };
  }

  await prisma.daftarInformasiPublik.delete({
    where: { id },
  });

  return {
    success: true,
    status: 200,
    body: "Daftar Informasi Publik berhasil dihapus",
  };
};

export default daftarInformasiPublikDelete;
