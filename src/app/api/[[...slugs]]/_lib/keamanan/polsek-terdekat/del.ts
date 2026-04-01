import prisma from "@/lib/prisma";
import { Context } from "elysia";

const polsekTerdekatDelete = async (context: Context) => {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  // 1. Hapus relasi dari pivot
  await prisma.layananToPolsek.deleteMany({
    where: { polsekTerdekatId: id },
  });

  // 2. Hapus pasar desa utama
  const deleted = await prisma.polsekTerdekat.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Berhasil menghapus polsek terdekat",
    data: deleted,
  };
};

export default polsekTerdekatDelete;
