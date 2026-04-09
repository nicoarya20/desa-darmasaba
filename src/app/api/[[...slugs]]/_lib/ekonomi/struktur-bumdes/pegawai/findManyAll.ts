/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function pegawaiFindManyAll(context: Context) {
  const search = (context.query.search as string) || "";
  const isActiveParam = context.query.isActive;

  // Buat where clause dinamis
  const where: any = {};

  if (isActiveParam !== undefined) {
    where.isActive = isActiveParam === "true";
  }

  if (search) {
    where.OR = [
      { namaLengkap: { contains: search, mode: "insensitive" } },
      { alamat: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const data = await prisma.pegawaiBumDes.findMany({
      where,
      include: {
        posisi: true,
        image: true,
      },
      orderBy: { posisi: { hierarki: "asc" } },
    });

    return {
      success: true,
      message: "Success fetch all pegawai (non-paginated)",
      total: data.length,
      data,
    };
  } catch (error) {
    console.error("Find many all error:", error);
    return {
      success: false,
      message: "Failed fetch all pegawai",
      total: 0,
      data: [],
    };
  }
}
