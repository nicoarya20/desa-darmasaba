import type { Prisma } from "@prisma/client";
import { t } from "elysia";
import { INOVASI_KATEGORI, isInovasiKategori, type InovasiKategori } from "@/lib/inovasi-teknologi/kategori";

// Literal dari tuple supaya tipe body Eden tetap "digital" | "tepat-guna" (map() menghilangkan tipe literal).
// Kategori baru → tambah literal di sini; test menjaga semua INOVASI_KATEGORI diterima.
const [DIGITAL, TEPAT_GUNA] = INOVASI_KATEGORI;

/** Skema body `kategori` (opsional: klien lama tanpa field ini tetap diterima). Nilai di luar daftar → 422. */
export const kategoriBodySchema = t.Optional(t.Union([t.Literal(DIGITAL), t.Literal(TEPAT_GUNA)]));

/** Hasil baca query `?kategori=`: kosong = semua kategori; nilai tak dikenal = tidak sah. */
export type KategoriFilter = { ok: true; kategori?: InovasiKategori } | { ok: false; value: string };

/** Baca query `?kategori=` find-many; kosong/`semua` → tanpa saringan. */
export function parseKategoriFilter(raw: unknown): KategoriFilter {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (value === "" || value === "semua") return { ok: true };
  return isInovasiKategori(value) ? { ok: true, kategori: value } : { ok: false, value };
}

/** Saringan find-many: hanya entri aktif, opsional per kategori, opsional kata kunci (nama/deskripsi). */
export function buildInovasiWhere(opts: { search?: string; kategori?: InovasiKategori }): Prisma.InovasiTeknologiDesaWhereInput {
  const where: Prisma.InovasiTeknologiDesaWhereInput = { isActive: true };
  if (opts.kategori) where.kategori = opts.kategori;
  const search = opts.search?.trim();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { deskripsi: { contains: search, mode: "insensitive" } },
    ];
  }
  return where;
}
