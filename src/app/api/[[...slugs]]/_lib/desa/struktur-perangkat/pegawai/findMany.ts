import prisma from "@/lib/prisma";
import { parseOptionalBoolean, parsePaging, totalPagesOf } from "@/lib/struktur-organisasi";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import { PEGAWAI_ORDER, PEGAWAI_SELECT } from "../http";

/**
 * GET publik: daftar pegawai berpaginasi di DB (limit maks 100), urut jabatan lalu nama.
 * `search` mencari di nama lengkap + nama jabatan; `isActive` opsional.
 */
export default async function pegawaiFindMany(context: Context) {
  const query = context.query ?? {};
  const { page, limit, skip } = parsePaging(query);
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const isActive = parseOptionalBoolean(query.isActive);

  const where: Prisma.PerangkatDesaWhereInput = {};
  if (isActive !== undefined) where.isActive = isActive;
  if (search) {
    where.OR = [
      { namaLengkap: { contains: search, mode: "insensitive" } },
      { posisi: { nama: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.perangkatDesa.findMany({ where, skip, take: limit, orderBy: PEGAWAI_ORDER, select: PEGAWAI_SELECT }),
    prisma.perangkatDesa.count({ where }),
  ]);

  return {
    success: true as const,
    message: "Berhasil mengambil daftar perangkat desa",
    data,
    page,
    limit,
    total,
    totalPages: totalPagesOf(total, limit),
  };
}
