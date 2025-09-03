/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function pelayananTelunjukSaktiDesaFindMany(
  context: Context
) {
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
    // Ambil data dan total count secara paralel
    const [data, total] = await Promise.all([
      prisma.pelayananTelunjukSaktiDesa.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.pelayananTelunjukSaktiDesa.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil pelayanan telunjuk sakti desa dengan pagination",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di findMany paginated:", e);
    return {
      success: false,
      message: "Gagal mengambil data pelayanan telunjuk sakti desa",
    };
  }
}
