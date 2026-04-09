import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

export default async function pencegahanKriminalitasFindMany(context: Context) {
  // Ambil parameter dari query
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  // Buat where clause dengan tipe yang benar
  const where: Prisma.PencegahanKriminalitasWhereInput = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      {
        judul: {
          contains: search,
          mode: "insensitive" as const,
        },
      },
      {
        deskripsi: {
          contains: search,
          mode: "insensitive" as const,
        },
      },
      {
        deskripsiSingkat: {
          contains: search,
          mode: "insensitive" as const,
        },
      },
    ];
  }
  try {
    const [data, total] = await Promise.all([
      prisma.pencegahanKriminalitas.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.pencegahanKriminalitas.count({ where }),
    ]);
    return {
      success: true,
      message: "Success fetch pencegahan kriminalitas",
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
      message: "Failed fetch pencegahan kriminalitas",
    };
  }
}
