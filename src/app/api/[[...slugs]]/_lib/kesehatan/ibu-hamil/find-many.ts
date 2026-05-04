/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function ibuHamilFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const status = (context.query.status as string) || "";
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  if (search) {
    where.OR = [
      { nama: { contains: search, mode: "insensitive" } },
      { nik: { contains: search, mode: "insensitive" } },
      { alamat: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) {
    where.status = status;
  }

  try {
    const [data, total] = await Promise.all([
      prisma.ibuHamil.findMany({
        where,
        include: { posyandu: { select: { id: true, name: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.ibuHamil.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil data ibu hamil",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error ibuHamilFindMany:", e);
    return { success: false, message: "Gagal mengambil data ibu hamil" };
  }
}
