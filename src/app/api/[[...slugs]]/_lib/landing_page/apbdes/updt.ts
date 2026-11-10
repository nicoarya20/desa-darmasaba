import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { assignParentIdsToApbdesItems } from "./lib/getParentsID";

type APBDesItemInput = {
  id?: string; // id item lama; kosong = item baru
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
  fileId?: string | null;
  items: APBDesItemInput[];
};

export default async function apbdesUpdate(context: Context) {
  const body = context.body as FormUpdateBody;
  const { id } = context.params as { id: string };

  try {
    // 1. Pastikan APBDes ada + ambil item aktif beserta realisasinya.
    //    Realisasi TIDAK dihapus di mana pun pada alur ini — cukup dibaca untuk
    //    rekalkulasi total. Inilah kunci pencegahan data-loss.
    const existing = await prisma.aPBDes.findUnique({
      where: { id },
      include: {
        items: {
          where: { isActive: true },
          include: {
            realisasiItems: { where: { isActive: true } },
          },
        },
      },
    });

    if (!existing) {
      context.set.status = 404;
      return { success: false, message: "APBDes tidak ditemukan" };
    }

    // Cegah duplikasi: tahun tidak boleh bentrok dengan APBDes aktif lain
    const duplikat = await prisma.aPBDes.findFirst({
      where: { tahun: body.tahun, deletedAt: null, NOT: { id } },
      select: { id: true },
    });
    if (duplikat) {
      context.set.status = 409;
      return {
        success: false,
        message: `APBDes tahun ${body.tahun} sudah tersedia. Pilih tahun lain atau ubah data yang sudah ada.`,
      };
    }

    const existingItems = existing.items;
    type ExistingItem = (typeof existingItems)[number];

    // 2. Cocokkan item form ke item lama.
    //    - Utamakan id item yang STABIL: kode boleh admin ubah bebas tanpa
    //      memutus link ke realisasi.
    //    - Fallback ke kode untuk item tanpa id (kompat klien lama).
    const existingById = new Map<string, ExistingItem>(
      existingItems.map((it) => [it.id, it])
    );
    const existingByKode = new Map<string, ExistingItem>();
    for (const it of existingItems) {
      if (!existingByKode.has(it.kode)) existingByKode.set(it.kode, it);
    }

    const matchedExistingIds = new Set<string>();
    const toUpdate: { old: ExistingItem; input: APBDesItemInput }[] = [];
    const toCreate: APBDesItemInput[] = [];

    for (const input of body.items) {
      let match: ExistingItem | undefined;
      if (input.id && existingById.has(input.id) && !matchedExistingIds.has(input.id)) {
        match = existingById.get(input.id);
      } else if (!input.id) {
        const byKode = existingByKode.get(input.kode);
        if (byKode && !matchedExistingIds.has(byKode.id)) match = byKode;
      }

      if (match) {
        matchedExistingIds.add(match.id);
        toUpdate.push({ old: match, input });
      } else {
        toCreate.push(input);
      }
    }

    // Item lama yang tidak lagi ada di form = dihapus admin.
    // Soft-delete (isActive=false) — realisasi fisiknya TIDAK ikut ke-cascade,
    // jadi riwayat tetap tersimpan & bisa dipulihkan.
    const toSoftDelete = existingItems.filter((it) => !matchedExistingIds.has(it.id));

    const now = new Date();

    // 3. Semua mutasi item + header APBDes dalam satu transaksi (atomik).
    //    Sebelumnya delete-all lalu recreate tanpa transaksi: gagal di tengah =
    //    realisasi hilang permanen.
    await prisma.$transaction(async (tx) => {
      // 3a. Update item lama in-place — realisasi tetap ter-link, hanya
      //     rekalkulasi total dari realisasi yang sudah ada.
      for (const { old, input } of toUpdate) {
        const totalRealisasi = old.realisasiItems.reduce((s, r) => s + r.jumlah, 0);
        const anggaran = input.anggaran;
        await tx.aPBDesItem.update({
          where: { id: old.id },
          data: {
            kode: input.kode,
            uraian: input.uraian,
            anggaran,
            level: input.level,
            tipe: input.tipe ?? null,
            totalRealisasi,
            selisih: anggaran - totalRealisasi,
            persentase: anggaran > 0 ? (totalRealisasi / anggaran) * 100 : 0,
            isActive: true,
            deletedAt: null,
          },
        });
      }

      // 3b. Buat item baru (belum punya realisasi).
      if (toCreate.length > 0) {
        await tx.aPBDesItem.createMany({
          data: toCreate.map((input) => ({
            apbdesId: id,
            kode: input.kode,
            uraian: input.uraian,
            anggaran: input.anggaran,
            level: input.level,
            tipe: input.tipe ?? null,
            totalRealisasi: 0,
            selisih: input.anggaran,
            persentase: 0,
            isActive: true,
          })),
        });
      }

      // 3c. Soft-delete item yang dihapus admin.
      if (toSoftDelete.length > 0) {
        await tx.aPBDesItem.updateMany({
          where: { id: { in: toSoftDelete.map((it) => it.id) } },
          data: { isActive: false, deletedAt: now },
        });
      }

      // 3d. Update data APBDes.
      await tx.aPBDes.update({
        where: { id },
        data: {
          tahun: body.tahun,
          name: body.name || `APBDes Tahun ${body.tahun}`,
          deskripsi: body.deskripsi,
          jumlah: body.jumlah,
          fileId: body.fileId === "" ? null : body.fileId,
        },
      });
    });

    // 4. Perbarui parentId untuk item aktif (kode bisa berubah → hierarki ikut).
    const activeItems = await prisma.aPBDesItem.findMany({
      where: { apbdesId: id, isActive: true },
      select: { id: true, kode: true },
    });
    await assignParentIdsToApbdesItems(activeItems);

    // 5. Ambil data lengkap untuk response (include realisasiItems).
    const result = await prisma.aPBDes.findUnique({
      where: { id },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { kode: "asc" },
          include: {
            realisasiItems: {
              where: { isActive: true },
              orderBy: { tanggal: "asc" },
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
