import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { assignParentIdsToApbdesItems } from "./lib/getParentsID";

type APBDesItemInput = {
  kode: string;
  uraian: string;
  anggaran: number;
  realisasi: number;
  selisih: number;
  persentase: number;
  level: number;
  tipe?: string | null;
};

type FormUpdateBody = {
  tahun: number;
  name?: string;
  deskripsi?: string;
  jumlah?: string;
  imageId: string;
  fileId: string;
  items: APBDesItemInput[];
};

export default async function apbdesUpdate(context: Context) {
  const body = context.body as FormUpdateBody;
  const { id } = context.params as { id: string };

  try {
    // 1. Pastikan APBDes ada
    const existing = await prisma.aPBDes.findUnique({
      where: { id },
    });

    if (!existing) {
      context.set.status = 404;
      return {
        success: false,
        message: "APBDes tidak ditemukan",
      };
    }

    // 2. Hapus semua item lama
    await prisma.aPBDesItem.deleteMany({
      where: { apbdesId: id },
    });

    // 3. Buat item baru tanpa parentId terlebih dahulu
    await prisma.aPBDesItem.createMany({
      data: body.items.map((item) => ({
        apbdesId: id,
        kode: item.kode,
        uraian: item.uraian,
        anggaran: item.anggaran,
        realisasi: item.realisasi,
        selisih: item.anggaran - item.realisasi,
        persentase: item.anggaran > 0 ? (item.realisasi / item.anggaran) * 100 : 0,
        level: item.level,
        tipe: item.tipe || null,
        isActive: true,
      })),
    });

    // 4. Dapatkan semua item yang baru dibuat untuk mendapatkan ID-nya
    const allItems = await prisma.aPBDesItem.findMany({
      where: { apbdesId: id },
      select: { id: true, kode: true },
    });

    // 5. Update parentId untuk setiap item
    // Pastikan allItems memiliki tipe yang benar
    const itemsForParentUpdate = allItems.map(item => ({
      id: item.id,
      kode: item.kode,
    }));
    
    await assignParentIdsToApbdesItems(itemsForParentUpdate);

    // 6. Update data APBDes
    await prisma.aPBDes.update({
      where: { id },
      data: {
        tahun: body.tahun,
        name: body.name || `APBDes Tahun ${body.tahun}`,
        deskripsi: body.deskripsi,
        jumlah: body.jumlah,
        imageId: body.imageId,
        fileId: body.fileId,
      },
    });

    // 5. Ambil data lengkap untuk response
    const result = await prisma.aPBDes.findUnique({
      where: { id },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { kode: 'asc' }
        },
        image: true,
        file: true,
      },
    });

    return {
      success: true,
      message: "Berhasil memperbarui APBDes",
      data: result,
    };
  } catch (error) {
    console.error("Error updating APBDes:", error);
    context.set.status = 500;
    return {
      success: false,
      message: "Gagal memperbarui APBDes",
    };
  }
}