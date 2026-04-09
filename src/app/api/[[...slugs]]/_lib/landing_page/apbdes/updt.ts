import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { assignParentIdsToApbdesItems } from "./lib/getParentsID";
import type { RealisasiItem } from "@prisma/client";

type APBDesItemInput = {
  kode: string;
  uraian: string;
  anggaran: number;
  level: number;
  tipe?: string | null;
};

type FormUpdateBody = {
  tahun: number;
  name?: string;
  deskripsi?: string;
  jumlah?: string;
  imageId?: string | null;
  fileId?: string | null;
  items: APBDesItemInput[];
};

export default async function apbdesUpdate(context: Context) {
  const body = context.body as FormUpdateBody;
  const { id } = context.params as { id: string };

  try {
    // 1. Pastikan APBDes ada
    const existing = await prisma.aPBDes.findUnique({
      where: { id },
      include: {
        items: {
          where: { isActive: true },
          include: {
            realisasiItems: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!existing) {
      context.set.status = 404;
      return {
        success: false,
        message: "APBDes tidak ditemukan",
      };
    }

    // 2. Build map untuk preserve realisasiItems berdasarkan kode
    const existingItemsMap = new Map<string, {
      id: string;
      realisasiItems: RealisasiItem[];
    }>();
    
    existing.items.forEach(item => {
      existingItemsMap.set(item.kode, {
        id: item.id,
        realisasiItems: item.realisasiItems,
      });
    });

    // 3. Hapus semua item lama (cascade akan menghapus realisasiItems juga)
    // TAPI kita sudah save realisasiItems di map atas
    await prisma.aPBDesItem.deleteMany({
      where: { apbdesId: id },
    });

    // 4. Buat item baru dengan preserve realisasiItems
    await prisma.aPBDesItem.createMany({
      data: await Promise.all(body.items.map(async (item) => {
        const anggaran = item.anggaran;
        
        // Check apakah item ini punya realisasiItems lama
        const existingItem = existingItemsMap.get(item.kode);
        const realisasiItemsData = existingItem?.realisasiItems || [];
        const totalRealisasi = realisasiItemsData.reduce((sum, r) => sum + r.jumlah, 0);
        const selisih = anggaran - totalRealisasi;
        const persentase = anggaran > 0 ? (totalRealisasi / anggaran) * 100 : 0;

        return {
          apbdesId: id,
          kode: item.kode,
          uraian: item.uraian,
          anggaran: anggaran,
          level: item.level,
          tipe: item.tipe || null,
          totalRealisasi,
          selisih,
          persentase,
          isActive: true,
        };
      })),
    });

    // 5. Dapatkan semua item yang baru dibuat untuk mendapatkan ID-nya
    const allItems = await prisma.aPBDesItem.findMany({
      where: { apbdesId: id },
      select: { id: true, kode: true },
    });

    // 6. Build map baru untuk item IDs
    const newItemIdsMap = new Map<string, string>();
    allItems.forEach(item => {
      newItemIdsMap.set(item.kode, item.id);
    });

    // 7. Re-create realisasiItems dengan link ke item IDs yang baru
    for (const [oldKode, oldItemData] of existingItemsMap.entries()) {
      if (oldItemData.realisasiItems.length > 0) {
        const newItemId = newItemIdsMap.get(oldKode);
        if (newItemId) {
          // Re-create realisasiItems untuk item ini
          await prisma.realisasiItem.createMany({
            data: oldItemData.realisasiItems.map(r => ({
              apbdesItemId: newItemId,
              kode: r.kode,
              jumlah: r.jumlah,
              tanggal: r.tanggal,
              keterangan: r.keterangan,
              buktiFileId: r.buktiFileId,
              isActive: true,
            })),
          });
        }
      }
    }

    // 8. Recalculate totalRealisasi setelah re-create realisasiItems
    for (const kode of existingItemsMap.keys()) {
      const newItemId = newItemIdsMap.get(kode);
      if (newItemId) {
        const realisasiItems = await prisma.realisasiItem.findMany({
          where: { apbdesItemId: newItemId, isActive: true },
        });
        const totalRealisasi = realisasiItems.reduce((sum, r) => sum + r.jumlah, 0);
        
        const item = await prisma.aPBDesItem.findUnique({
          where: { id: newItemId },
        });
        
        if (item) {
          const selisih = item.anggaran - totalRealisasi;
          const persentase = item.anggaran > 0 ? (totalRealisasi / item.anggaran) * 100 : 0;
          
          await prisma.aPBDesItem.update({
            where: { id: newItemId },
            data: { totalRealisasi, selisih, persentase },
          });
        }
      }
    }

    // 9. Update parentId untuk setiap item
    const itemsForParentUpdate = allItems.map(item => ({
      id: item.id,
      kode: item.kode,
    }));

    await assignParentIdsToApbdesItems(itemsForParentUpdate);

    // 10. Update data APBDes
    await prisma.aPBDes.update({
      where: { id },
      data: {
        tahun: body.tahun,
        name: body.name || `APBDes Tahun ${body.tahun}`,
        deskripsi: body.deskripsi,
        jumlah: body.jumlah,
        imageId: body.imageId === '' ? null : body.imageId,
        fileId: body.fileId === '' ? null : body.fileId,
      },
    });

    // 11. Ambil data lengkap untuk response (include realisasiItems)
    const result = await prisma.aPBDes.findUnique({
      where: { id },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { kode: 'asc' },
          include: {
            realisasiItems: {
              where: { isActive: true },
              orderBy: { tanggal: 'asc' },
            },
          },
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