/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function kategoriBukuFindManyAll(context: Context) {
  const search = (context.query.search as string) || "";
  const isActiveParam = context.query.isActive;

  // Buat where clause dinamis
  const where: any = {};

  if (isActiveParam !== undefined) {
    where.isActive = isActiveParam === "true";
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const data = await prisma.kategoriBuku.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      message: "Success fetch all kategori buku (non-paginated)",
      total: data.length,
      data,
    };
  } catch (error) {
    console.error("Find many all error:", error);
    return {
      success: false,
      message: "Failed fetch all kategori buku",
      total: 0,
      data: [],
    };
  }
}
