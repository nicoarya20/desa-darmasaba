import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

export default async function pencegahanKriminalitasFindFirst(context: Context) {
  // Ambil parameter query
  const search = (context.query.search as string) || "";

  // Buat where clause
  const where: Prisma.PencegahanKriminalitasWhereInput = { isActive: true };

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
    const data = await prisma.pencegahanKriminalitas.findFirst({
      where,
      orderBy: { createdAt: "desc" }, // ambil yang terbaru
    });

    if (!data) {
      return {
        success: false,
        message: "Data pencegahan kriminalitas tidak ditemukan",
      };
    }

    return {
      success: true,
      message: "Success fetch first pencegahan kriminalitas",
      data,
    };
  } catch (error) {
    console.error("Find first error:", error);
    return {
      success: false,
      message: "Failed fetch first pencegahan kriminalitas",
    };
  }
}
