import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { Prisma } from "@prisma/client";

export default async function kontakItemFindMany(context: Context) {
  // Ambil parameter dari query
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  // Buat where clause dengan tipe yang benar
  const where: Prisma.KontakItemWhereInput = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { nama: { contains: search, mode: "insensitive" as const } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.kontakItem.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.kontakItem.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil kontak item dengan pagination",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Find many error:", e);
    return {
      success: false,
      message: "Failed fetch kontak item",
    };
  }
}
