import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function pasarDesaDelete(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  // 1. Hapus relasi dari pivot
  await prisma.kategoriToPasar.deleteMany({
    where: { pasarDesaId: id },
  });

  // 2. Hapus pasar desa utama
  const deleted = await prisma.pasarDesa.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Berhasil menghapus pasar desa",
    data: deleted,
  };
}
