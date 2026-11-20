import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import type { Prisma } from "@prisma/client";
import {
  LEMBAGA_KOMUNITAS_DEFAULT_LIMIT,
  LEMBAGA_KOMUNITAS_MAX_LIMIT,
  LEMBAGA_KOMUNITAS_SEARCH_MAX,
} from "@/lib/lembaga-komunitas";
import { LEMBAGA_KOMUNITAS_FOTO_SELECT } from "./lembaga-komunitas.foto";

/** Kolom lembaga yang dikirim ke klien (tanpa kolom bookkeeping createdAt/updatedAt/deletedAt/isActive/fotoId). */
export const LEMBAGA_KOMUNITAS_SELECT = {
  id: true,
  nama: true,
  jenis: true,
  deskripsi: true,
  ketua: true,
  kontak: true,
  urutan: true,
  foto: { select: LEMBAGA_KOMUNITAS_FOTO_SELECT },
} as const;

/** Filter baris yang tampil: aktif dan belum dihapus. */
export const LEMBAGA_KOMUNITAS_AKTIF = { isActive: true, deletedAt: null } as const;

/** Urutan daftar: per jenis (A-Z), lalu `urutan` buatan admin, lalu nama. */
export const LEMBAGA_KOMUNITAS_ORDER_BY: Prisma.LembagaKomunitasOrderByWithRelationInput[] = [
  { jenis: "asc" },
  { urutan: "asc" },
  { nama: "asc" },
];

/** Bilangan bulat positif dari query string; bukan angka valid → `fallback`. */
function positiveInt(raw: unknown, fallback: number): number {
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) && n >= 1 ? n : fallback;
}

/** Teks query string dipotong ke `max` karakter; bukan teks → string kosong. */
function queryText(raw: unknown, max: number): string {
  return (typeof raw === "string" ? raw : "").trim().slice(0, max);
}

/**
 * GET publik daftar lembaga aktif: filter `jenis` (tepat, tanpa beda huruf besar-kecil) dan `q` (nama/jenis/ketua,
 * maks 100 karakter), paginasi `page`/`limit` (limit dibatasi 100). Mengembalikan data + total.
 */
export default async function lembagaKomunitasFindMany(context: Context) {
  const query = context.query as Record<string, unknown>;
  const page = positiveInt(query.page, 1);
  const limit = Math.min(LEMBAGA_KOMUNITAS_MAX_LIMIT, positiveInt(query.limit, LEMBAGA_KOMUNITAS_DEFAULT_LIMIT));
  const jenis = queryText(query.jenis, LEMBAGA_KOMUNITAS_SEARCH_MAX);
  const q = queryText(query.q, LEMBAGA_KOMUNITAS_SEARCH_MAX);

  const where: Prisma.LembagaKomunitasWhereInput = { ...LEMBAGA_KOMUNITAS_AKTIF };
  if (jenis) where.jenis = { equals: jenis, mode: "insensitive" };
  if (q) {
    where.OR = [
      { nama: { contains: q, mode: "insensitive" } },
      { jenis: { contains: q, mode: "insensitive" } },
      { ketua: { contains: q, mode: "insensitive" } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.lembagaKomunitas.findMany({
        where,
        orderBy: LEMBAGA_KOMUNITAS_ORDER_BY,
        skip: (page - 1) * limit,
        take: limit,
        select: LEMBAGA_KOMUNITAS_SELECT,
      }),
      prisma.lembagaKomunitas.count({ where }),
    ]);
    return { success: true, data, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  } catch (error) {
    console.error("Gagal mengambil daftar Lembaga & Komunitas:", error);
    context.set.status = 500;
    return { success: false, message: "Gagal mengambil daftar Lembaga & Komunitas" };
  }
}
