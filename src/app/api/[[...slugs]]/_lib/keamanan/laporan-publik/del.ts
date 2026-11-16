import { optionalAuth } from "@/lib/api-auth";
import { AUDIT_ACTIONS, audit } from "@/lib/audit";
import prisma from "@/lib/prisma";
import { Context } from "elysia";

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

    await audit({
      // Sesi sudah diwajibkan guard global /api untuk DELETE.
      actor: await optionalAuth(),
      action: AUDIT_ACTIONS.LAPORAN_PUBLIK_DELETE,
      targetType: "laporan_publik",
      targetId: id,
      summary: `Menghapus laporan publik berstatus ${laporan.status}`,
      meta: { status: laporan.status },
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
