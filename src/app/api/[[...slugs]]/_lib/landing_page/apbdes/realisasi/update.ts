/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

type RealisasiUpdateBody = {
  jumlah?: number;
  tanggal?: string;
  keterangan?: string;
  buktiFileId?: string;
};

export default async function realisasiUpdate(context: Context) {
  const { realisasiId } = context.params as { realisasiId: string };
  const body = context.body as RealisasiUpdateBody;

  console.log('Updating realisasi:', JSON.stringify(body, null, 2));

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

    // 2. Update realisasi
    const updated = await prisma.realisasiItem.update({
      where: { id: realisasiId },
      data: {
        ...(body.jumlah !== undefined && { jumlah: body.jumlah }),
        ...(body.tanggal !== undefined && { tanggal: new Date(body.tanggal) }),
        ...(body.keterangan !== undefined && { keterangan: body.keterangan }),
        ...(body.buktiFileId !== undefined && { buktiFileId: body.buktiFileId }),
      },
    });

    // 3. Recalculate totalRealisasi, selisih, persentase di APBDesItem
    const allRealisasi = await prisma.realisasiItem.findMany({
      where: { apbdesItemId: existing.apbdesItemId, isActive: true },
      select: { jumlah: true },
    });

    const item = await prisma.aPBDesItem.findUnique({
      where: { id: existing.apbdesItemId },
    });

    if (item) {
      const totalRealisasi = allRealisasi.reduce((sum, r) => sum + r.jumlah, 0);
      const selisih = item.anggaran - totalRealisasi; // Sisa anggaran (positif = belum digunakan)
      const persentase = item.anggaran > 0 ? (totalRealisasi / item.anggaran) * 100 : 0;

      await prisma.aPBDesItem.update({
        where: { id: existing.apbdesItemId },
        data: {
          totalRealisasi,
          selisih,
          persentase,
        },
      });
    }

    return {
      success: true,
      message: "Realisasi berhasil diperbarui",
      data: updated,
      meta: {
        totalRealisasi: allRealisasi.reduce((sum, r) => sum + r.jumlah, 0),
      },
    };
  } catch (error: any) {
    console.error("Error updating realisasi:", error);
    context.set.status = 500;
    return {
      success: false,
      message: `Gagal memperbarui realisasi: ${error.message}`,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    };
  }
}
