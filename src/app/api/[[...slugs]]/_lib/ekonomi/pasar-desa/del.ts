import prisma from "@/lib/prisma";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

const pasarDesaDelete = async (context: Context) => {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const pasarDesa = await prisma.pasarDesa.findUnique({
    where: { id },
    include: {
      image: true,
      kategori: true,
    },
  });

  if (!pasarDesa) {
    return {
      status: 404,
      body: "Pasar desa tidak ditemukan",
    };
  }

  if (pasarDesa.image) {
    try {
      const filePath = path.join(pasarDesa.image.path, pasarDesa.image.name);
      await fs.unlink(filePath);
      await prisma.fileStorage.delete({
        where: { id: pasarDesa.image.id },
      });
    } catch (err) {
      console.error("Gagal hapus file image:", err);
    }
  }
  

  await prisma.pasarDesa.delete({
    where: { id },
  });

  return {
    status: 200,
    success: true,
    message: "Pasar desa berhasil dihapus",
  };
};
export default pasarDesaDelete;
