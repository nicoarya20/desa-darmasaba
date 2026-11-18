import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

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

  // Berkas PDF baris ini dihapus permanen SETELAH barisnya terhapus; berkas yang masih dirujuk data lain dibiarkan.
  if (daftarInformasi.fileId) {
    await removeStoredFile({ id: daftarInformasi.fileId }, "DaftarInformasiPublik");
  }

  return {
    success: true,
    status: 200,
    body: "Daftar Informasi Publik berhasil dihapus",
  };
};

export default daftarInformasiPublikDelete;
