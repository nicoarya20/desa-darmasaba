/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { BANK_SAMPAH_LIST_OMIT } from "./bank-sampah.data";

// Batas atas `limit` agar satu request tidak menarik seluruh tabel.
const MAX_LIMIT = 100;

/** GET (publik): daftar bank sampah berpaginasi; ringan (tanpa deskripsi/medsos/relasi). */
export default async function keteranganBankSampahTerdekatFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(context.query.limit) || 10));
  const search = (context.query.search as string) || '';
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    // Cari di semua field yang ditampilkan ke user (nama tempat & alamat),
    // bukan hanya `name` — sebelumnya search hanya menemukan 1 data.
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { namaTempatMaps: { contains: search, mode: 'insensitive' } },
      { alamat: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.keteranganBankSampahTerdekat.findMany({
        where,
        skip,
        take: limit,
        omit: BANK_SAMPAH_LIST_OMIT,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.keteranganBankSampahTerdekat.count({
        where,
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Success fetch keterangan bank sampah terdekat with pagination",
      data,
      page,
      totalPages,
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch keterangan bank sampah terdekat with pagination",
      data: [],
      page: 1,
      totalPages: 1,
      total: 0,
    };
  }
}