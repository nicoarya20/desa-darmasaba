import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import { IMAGE_SELECT, parsePagination } from "../http";

/**
 * GET publik: daftar unit usaha berpaginasi, urut `urutan` lalu `createdAt`.
 * Default hanya unit aktif; admin menambah `includeInactive=true`.
 */
export default async function unitUsahaFindMany(context: Context) {
  const { page, limit, skip } = parsePagination(context.query);
  const search = typeof context.query.search === "string" ? context.query.search.trim() : "";
  const includeInactive = context.query.includeInactive === "true";

  const where: Prisma.UnitUsahaBumDesWhereInput = { deletedAt: null };
  if (!includeInactive) where.isActive = true;
  if (search) {
    where.OR = [
      { nama: { contains: search, mode: "insensitive" } },
      { deskripsi: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.unitUsahaBumDes.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
      include: { image: IMAGE_SELECT },
    }),
    prisma.unitUsahaBumDes.count({ where }),
  ]);

  return {
    success: true,
    message: "Berhasil mengambil daftar unit usaha BUMDes",
    data,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    total,
  };
}
