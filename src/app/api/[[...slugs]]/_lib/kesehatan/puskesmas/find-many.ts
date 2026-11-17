import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import { PUSTU_RINGKAS_SELECT, keRingkas } from "./pustu.data";

/** Batas atas `limit` agar daftar tetap berpaginasi. */
const MAX_LIMIT = 50;

/** GET (publik): daftar PUSTU aktif berpaginasi (ringan), pencarian nama/alamat. */
async function puskesmasFindMany(context: Context) {
  const page = Math.max(1, Number(context.query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(context.query.limit) || 10));
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  const where: Prisma.PuskesmasWhereInput = { isActive: true };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { alamat: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [rows, total] = await Promise.all([
      prisma.puskesmas.findMany({ where, select: PUSTU_RINGKAS_SELECT, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.puskesmas.count({ where }),
    ]);
    return {
      success: true,
      message: "Berhasil mengambil daftar PUSTU",
      data: rows.map(keRingkas),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("[pustu] Gagal mengambil daftar:", error);
    return { success: false, message: "Gagal mengambil daftar PUSTU" };
  }
}

export default puskesmasFindMany;
