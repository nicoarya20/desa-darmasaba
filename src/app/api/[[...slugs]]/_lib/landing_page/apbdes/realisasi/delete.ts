/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function realisasiDelete(context: Context) {
  const { realisasiId } = context.params as { realisasiId: string };

  console.log('Deleting realisasi:', realisasiId);

  try {
    // 1. Pastikan realisasi ada
    const existing = await prisma.realisasiItem.findUnique({
      where: { id: realisasiId },
    });

    if (!existing) {
      context.set.status = 404;
      return {
        success: false,
        message: "Realisasi tidak ditemukan",
      };
    }

    const apbdesItemId = existing.apbdesItemId;

    // 2. Soft delete realisasi (set isActive = false)
    await prisma.realisasiItem.update({
      where: { id: realisasiId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    // 3. Recalculate totalRealisasi, selisih, persentase di APBDesItem
    const allRealisasi = await prisma.realisasiItem.findMany({
      where: { apbdesItemId, isActive: true },
      select: { jumlah: true },
    });

    const item = await prisma.aPBDesItem.findUnique({
      where: { id: apbdesItemId },
    });

    if (item) {
      const totalRealisasi = allRealisasi.reduce((sum, r) => sum + r.jumlah, 0);
      const selisih = item.anggaran - totalRealisasi; // Sisa anggaran (positif = belum digunakan)
      const persentase = item.anggaran > 0 ? (totalRealisasi / item.anggaran) * 100 : 0;

      await prisma.aPBDesItem.update({
        where: { id: apbdesItemId },
        data: {
          totalRealisasi,
          selisih,
          persentase,
        },
      });
    }

    return {
      success: true,
      message: "Realisasi berhasil dihapus",
    };
  } catch (error: any) {
    console.error("Error deleting realisasi:", error);
    context.set.status = 500;
    return {
      success: false,
      message: `Gagal menghapus realisasi: ${error.message}`,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    };
  }
}
