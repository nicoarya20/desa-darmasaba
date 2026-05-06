import prisma from "@/lib/prisma";
import { Context } from "elysia";

const cctvDelete = async (context: Context) => {
  const id = context.params.id as string;

  try {
    const cctv = await prisma.cctvKeamanan.findUnique({ where: { id } });

    if (!cctv) {
      return { success: false, message: "CCTV tidak ditemukan" };
    }

    await prisma.cctvKeamanan.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });

    return { success: true, message: "CCTV berhasil dihapus" };
  } catch (error) {
    console.error("Gagal delete CCTV:", error);
    return { success: false, message: "Terjadi kesalahan saat menghapus CCTV" };
  }
};

export default cctvDelete;
