/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function jadwalKegiatanFindMany(context: Context) {
  // Ambil parameter dari query
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  // Buat where clause
  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { informasijadwalkegiatan: { name: { contains: search, mode: "insensitive" } } },
      { deskripsijadwalkegiatan: { deskripsi: { contains: search, mode: "insensitive" } } },
      {layananjadwalkegiatan: { content: { contains: search, mode: "insensitive" } } },
      {syaratketentuanjadwalkegiatan: { content: { contains: search, mode: "insensitive" } } },
      {dokumenjadwalkegiatan: { content: { contains: search, mode: "insensitive" } } },
    ];
  }
  try {
    const [data, total] = await Promise.all([
      prisma.jadwalKegiatan.findMany({
        where,
        include: {
          informasijadwalkegiatan: true,
          deskripsijadwalkegiatan: true,
          layananjadwalkegiatan: true,
          syaratketentuanjadwalkegiatan: true,
          dokumenjadwalkegiatan: true,
          },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.jadwalKegiatan.count({ where }),
    ]);
    return {
      success: true,
      message: "Success fetch jadwal kegiatan",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Find many error:", error);
    return {
      success: false,
      message: "Failed fetch jadwal kegiatan",
    };
  }
}
