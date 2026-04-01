/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";

/**
 * Helper untuk mengisi parentId pada item APBDes berdasarkan struktur kode.
 * Harus dipanggil setelah semua item berhasil dibuat (dengan id yang valid).
 *
 * @param items - Array item yang sudah punya { id, kode }
 */
export async function assignParentIdsToApbdesItems(
  items: { id: string; kode: string }[]
): Promise<void> {
  // Buat lookup berdasarkan kode → id
  const kodeToId = new Map<string, string>();
  for (const item of items) {
    kodeToId.set(item.kode, item.id);
  }

  // Siapkan batch update
  const updates: Promise<any>[] = [];

  for (const item of items) {
    const { id, kode } = item;

    // Skip jika kode tidak memiliki parent (level 1, misal "4")
    if (!kode.includes(".")) {
      // Pastikan parentId null untuk akar
      updates.push(
        prisma.aPBDesItem.update({
          where: { id },
          data: { parentId: null },
        })
      );
      continue;
    }

    // Ambil kode parent: "4.1.2" → "4.1"
    const parts = kode.split(".");
    parts.pop(); // hapus bagian terakhir
    const parentKode = parts.join(".");

    const parentID = kodeToId.get(parentKode) || null;

    updates.push(
      prisma.aPBDesItem.update({
        where: { id },
        data: { parentId: parentID },
      })
    );
  }

  // Jalankan semua update secara paralel
  await Promise.all(updates);
}