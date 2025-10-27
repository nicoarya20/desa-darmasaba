/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function dataPerpustakaanFindManyAll(context: Context) {
  const search = (context.query.search as string) || "";
  const isActiveParam = context.query.isActive;

  // Buat where clause dinamis
  const where: any = {};

  if (isActiveParam !== undefined) {
    where.isActive = isActiveParam === "true";
  }

  if (search) {
    where.OR = [
      { judul: { contains: search, mode: "insensitive" } },
      { deskripsi: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const data = await prisma.dataPerpustakaan.findMany({
      where,
      include: {
        kategori: true,
        image: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      message: "Success fetch all data perpustakaan (non-paginated)",
      total: data.length,
      data,
    };
  } catch (error) {
    console.error("Find many all error:", error);
    return {
      success: false,
      message: "Failed fetch all data perpustakaan",
      total: 0,
      data: [],
    };
  }
}
