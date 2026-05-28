/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function balitaFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const statusStunting = (context.query.statusStunting as string) || "";
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  if (search) {
    where.OR = [
      { nama: { contains: search, mode: "insensitive" } },
      { nik: { contains: search, mode: "insensitive" } },
      { namaOrtu: { contains: search, mode: "insensitive" } },
      { alamat: { contains: search, mode: "insensitive" } },
    ];
  }

  if (statusStunting) {
    where.statusStunting = statusStunting;
  }

  try {
    const [data, total] = await Promise.all([
      prisma.balita.findMany({
        where,
        include: {
          posyandu: {
            select: {
              id: true,
              name: true,
              banjar: { select: { id: true, name: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.balita.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil data balita",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error balitaFindMany:", e);
    return { success: false, message: "Gagal mengambil data balita" };
  }
}
