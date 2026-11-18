import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import type { Prisma } from "@prisma/client";
import {
  PESAN_PRODUK_HUKUM,
  PRODUK_HUKUM_DEFAULT_LIMIT,
  PRODUK_HUKUM_MAX_LIMIT,
  PRODUK_HUKUM_SEARCH_MAX,
  isKategoriProdukHukum,
} from "@/lib/produk-hukum";
import { PPID_FILE_SELECT } from "../../ppid/ppid-file";

/** Kolom produk hukum yang dikirim ke klien (berkas: id, link, realName; tanpa path internal atau data lain). */
export const PRODUK_HUKUM_SELECT = {
  id: true,
  judul: true,
  nomor: true,
  tahun: true,
  kategori: true,
  file: { select: PPID_FILE_SELECT },
} as const;

/** Filter produk hukum yang tampil: aktif dan belum dihapus. */
export const PRODUK_HUKUM_AKTIF = { isActive: true, deletedAt: null } as const;

/** Urutan daftar: tahun terbaru dulu (tanpa tahun di akhir), lalu `urutan` buatan admin, lalu tanggal buat. */
export const PRODUK_HUKUM_ORDER_BY: Prisma.ProdukHukumOrderByWithRelationInput[] = [
  { tahun: { sort: "desc", nulls: "last" } },
  { urutan: "asc" },
  { createdAt: "asc" },
];

/** Bilangan bulat positif dari query string; bukan angka valid → `fallback`. */
function positiveInt(raw: unknown, fallback: number): number {
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) && n >= 1 ? n : fallback;
}

/**
 * GET publik daftar produk hukum aktif: filter `kategori` (nilai tak sah → 400) dan `q` (judul/nomor, tanpa beda
 * huruf besar-kecil, maks 100 karakter), paginasi `page`/`limit` (limit dibatasi 50). Mengembalikan data + total.
 */
export default async function produkHukumFindMany(context: Context) {
  const query = context.query as Record<string, unknown>;
  const page = positiveInt(query.page, 1);
  const limit = Math.min(PRODUK_HUKUM_MAX_LIMIT, positiveInt(query.limit, PRODUK_HUKUM_DEFAULT_LIMIT));
  const kategori = typeof query.kategori === "string" ? query.kategori : "";
  const q = (typeof query.q === "string" ? query.q : "").trim().slice(0, PRODUK_HUKUM_SEARCH_MAX);

  if (kategori && !isKategoriProdukHukum(kategori)) {
    context.set.status = 400;
    return { success: false, message: PESAN_PRODUK_HUKUM.kategoriTidakValid };
  }

  const where: Prisma.ProdukHukumWhereInput = { ...PRODUK_HUKUM_AKTIF };
  if (kategori) where.kategori = kategori;
  if (q) {
    where.OR = [
      { judul: { contains: q, mode: "insensitive" } },
      { nomor: { contains: q, mode: "insensitive" } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.produkHukum.findMany({
        where,
        orderBy: PRODUK_HUKUM_ORDER_BY,
        skip: (page - 1) * limit,
        take: limit,
        select: PRODUK_HUKUM_SELECT,
      }),
      prisma.produkHukum.count({ where }),
    ]);
    return { success: true, data, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  } catch (error) {
    console.error("Gagal mengambil daftar produk hukum:", error);
    context.set.status = 500;
    return { success: false, message: "Gagal mengambil daftar produk hukum" };
  }
}
