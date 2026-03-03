/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

type RealisasiCreateBody = {
  jumlah: number;
  tanggal: string; // ISO format
  keterangan?: string;
  buktiFileId?: string;
};

export default async function realisasiCreate(context: Context) {
  const { itemId } = context.params as { itemId: string };
  const body = context.body as RealisasiCreateBody;

  console.log('Creating realisasi:', JSON.stringify(body, null, 2));

  try {
    // 1. Pastikan APBDesItem ada
    const item = await prisma.aPBDesItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      context.set.status = 404;
      return {
        success: false,
        message: "Item APBDes tidak ditemukan",
      };
    }

    // 2. Create realisasi item
    const realisasi = await prisma.realisasiItem.create({
      data: {
        apbdesItemId: itemId,
        jumlah: body.jumlah,
        tanggal: new Date(body.tanggal),
        keterangan: body.keterangan,
        buktiFileId: body.buktiFileId,
      },
    });

    // 3. Update totalRealisasi, selisih, persentase di APBDesItem
    const allRealisasi = await prisma.realisasiItem.findMany({
      where: { apbdesItemId: itemId, isActive: true },
      select: { jumlah: true },
    });

    const totalRealisasi = allRealisasi.reduce((sum, r) => sum + r.jumlah, 0);
    const selisih = totalRealisasi - item.anggaran;
    const persentase = item.anggaran > 0 ? (totalRealisasi / item.anggaran) * 100 : 0;

    await prisma.aPBDesItem.update({
      where: { id: itemId },
      data: {
        totalRealisasi,
        selisih,
        persentase,
      },
    });

    // 4. Return response
    return {
      success: true,
      message: "Realisasi berhasil ditambahkan",
      data: realisasi,
      meta: {
        totalRealisasi,
        selisih,
        persentase,
      },
    };
  } catch (error: any) {
    console.error("Error creating realisasi:", error);
    context.set.status = 500;
    return {
      success: false,
      message: `Gagal menambahkan realisasi: ${error.message}`,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    };
  }
}
