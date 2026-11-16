import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Sumber grafik IKM publik (beranda & /ppid/indeks-kepuasan-masyarakat). Daftar lengkap `findMany` admin-only
// karena memuat nama responden; di sini hanya tanggal + nama kategori, tanpa id & nama (UU PDP, aspek 8 lomba).

/** Batas baris ringkasan publik per permintaan. */
export const RINGKASAN_RESPONDEN_MAX = 1000;

const PILIH_NAMA = { select: { name: true } } as const;

/** GET ringkasan responden IKM publik: `data` (tanggal + jenis kelamin/rating/kelompok umur) & `total`. */
export default async function respondenRingkasan(context: Context) {
  const diminta = Number(context.query.limit) || RINGKASAN_RESPONDEN_MAX;
  const take = Math.min(Math.max(diminta, 1), RINGKASAN_RESPONDEN_MAX);
  const where = { isActive: true };

  try {
    const [data, total] = await Promise.all([
      prisma.responden.findMany({
        where,
        select: { tanggal: true, createdAt: true, jenisKelamin: PILIH_NAMA, rating: PILIH_NAMA, kelompokUmur: PILIH_NAMA },
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.responden.count({ where }),
    ]);
    return { success: true, message: "Berhasil ambil ringkasan responden", data, total };
  } catch (e) {
    console.error("Gagal mengambil ringkasan responden IKM:", e);
    context.set.status = 500;
    return { success: false, message: "Gagal mengambil ringkasan responden" };
  }
}
