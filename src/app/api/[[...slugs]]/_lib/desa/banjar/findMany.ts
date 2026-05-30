/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function banjarFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  if (search) {
    where.OR = [{ name: { contains: search, mode: "insensitive" } }];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.banjar.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.banjar.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil data banjar",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di banjar findMany:", e);
    return { success: false, message: "Gagal mengambil data banjar" };
  }
}

export default banjarFindMany;
