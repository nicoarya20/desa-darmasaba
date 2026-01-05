/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function pegawaiFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;
  const isActiveParam = context.query.isActive;

  // where clause dinamis
  const where: any = {};
  if (isActiveParam !== undefined) {
    where.isActive = isActiveParam === "true";
  }

  if (search) {
    where.OR = [
      { namaLengkap: { contains: search, mode: "insensitive" } },
      { alamat: { contains: search, mode: "insensitive" } },
      { posisi: { nama: { contains: search, mode: "insensitive" } } },
    ];
  }

  try {
    // Ambil semua data terlebih dahulu (tanpa pagination)
    const [allData, total] = await Promise.all([
      prisma.pegawaiBumDes.findMany({
        where,
        include: {
          posisi: true,
          image: true,
        },
      }),
      prisma.pegawaiBumDes.count({ where }),
    ]);

    // Sort manual berdasarkan hierarki posisi
    const sortedData = allData.sort((a, b) => {
      // Sort berdasarkan hierarki terlebih dahulu
      if (a.posisi.hierarki !== b.posisi.hierarki) {
        return a.posisi.hierarki - b.posisi.hierarki;
      }
      // Jika hierarki sama, sort berdasarkan nama posisi
      return a.posisi.nama.localeCompare(b.posisi.nama);
    });

    // Lakukan pagination manual setelah sorting
    const paginatedData = sortedData.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Success fetch pegawai with hierarchy order",
      data: paginatedData,
      page,
      totalPages,
      total,
    };
  } catch (error) {
    console.error("Find many pegawai error:", error);
    return {
      success: false,
      message: "Failed fetch pegawai",
      data: [],
      page: 1,
      totalPages: 1,
      total: 0,
    };
  }
}
