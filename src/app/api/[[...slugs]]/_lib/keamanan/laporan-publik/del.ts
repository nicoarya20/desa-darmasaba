import prisma from "@/lib/prisma";
import type { Context } from "elysia";

const laporanPublikDelete = async (context: Context) => {
  const id = context.params.id as string;

  try {
    // Cek dulu apakah data ada
    const laporan = await prisma.laporanPublik.findUnique({
      where: { id }
    });

    if (!laporan) {
      return {
        success: false,
        message: "Laporan tidak ditemukan"
      };
    }

    // Hapus data
    await prisma.laporanPublik.delete({
      where: { id }
    });

    return {
      success: true,
      message: "Laporan berhasil dihapus"
    };
  } catch (error) {
    console.error("Gagal delete laporan:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus laporan"
    };
  }
};

export default laporanPublikDelete;
