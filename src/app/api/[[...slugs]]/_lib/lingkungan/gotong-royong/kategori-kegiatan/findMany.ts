/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function kategoriKegiatanFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  // Buat where clause
  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [{ nama: { contains: search, mode: "insensitive" } }];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.kategoriKegiatan.findMany({
        where: where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.kategoriKegiatan.count({
        where: where,
      }),
    ]);

    return {
      success: true,
      data: data.map((item: any) => {
        return {
          id: item.id,
          nama: item.nama,
        };
      }),
      message: "Success fetch administrasi online with pagination",
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch administrasi online with pagination",
    };
  }
}
