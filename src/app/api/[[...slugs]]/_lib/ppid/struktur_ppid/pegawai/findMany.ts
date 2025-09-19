/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Di findMany.ts
export default async function pegawaiFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  // Buat where clause
  const isActiveParam = context.query.isActive;

  const where: any = {};
  if (isActiveParam !== undefined) {
    where.isActive = isActiveParam === "true";
  }

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { namaLengkap: { contains: search, mode: "insensitive" } },
      { alamat: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.pegawaiPPID.findMany({
        where,
        include: {
          posisi: true,
          image: true,
        },
        skip,
        take: limit,
        orderBy: { posisi: { hierarki: "asc" } },
      }),
      prisma.pegawaiPPID.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Success fetch pegawai with pagination",
      data,
      page,
      totalPages,
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch pegawai with pagination",
      data: [],
      page: 1,
      totalPages: 1,
      total: 0,
    };
  }
}
