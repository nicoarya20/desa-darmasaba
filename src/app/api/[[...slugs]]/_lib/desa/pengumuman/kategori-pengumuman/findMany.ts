/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function kategoriPengumumanFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  // Buat where clause
  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [{ name: { contains: search, mode: "insensitive" } }];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.categoryPengumuman.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              pengumumans: true,
            },
          },
        },
      }),
      prisma.categoryPengumuman.count({ where }),
    ]);
    return {
      success: true,
      message: "Berhasil ambil kategori potensi dengan pagination",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error di findMany paginated:", error);
    return {
      success: false,
      message: "Gagal mengambil data kategori potensi",
    };
  }
}

export default kategoriPengumumanFindMany;
