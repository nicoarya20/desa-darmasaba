import { parseOptionalBoolean, parsePaging, totalPagesOf } from "@/lib/struktur-organisasi";
import { Context } from "elysia";
import { liveWhere, type StrukturApiConfig } from "./config";
import { fail, PEGAWAI_ORDER, PEGAWAI_SELECT } from "./http";
import type { StrukturPegawai } from "./types";

type PegawaiWhere = {
  deletedAt?: null;
  isActive?: boolean;
  OR?: Record<string, unknown>[];
};

/** Handler baca pegawai (GET publik) untuk satu struktur: daftar berpaginasi + detail. */
export function createPegawaiReadHandlers(config: StrukturApiConfig) {
  const db = config.pegawai;

  /**
   * GET publik: daftar pegawai berpaginasi di DB (limit maks 100), urut jabatan lalu nama.
   * `search` mencari di nama lengkap + nama jabatan; `isActive` opsional.
   */
  async function findMany(context: Context) {
    const query = context.query ?? {};
    const { page, limit, skip } = parsePaging(query);
    const search = typeof query.search === "string" ? query.search.trim() : "";
    const isActive = parseOptionalBoolean(query.isActive);

    const where: PegawaiWhere = { ...liveWhere(config) };
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { namaLengkap: { contains: search, mode: "insensitive" } },
        { posisi: { nama: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [data, total] = await Promise.all([
      db().findMany({ where, skip, take: limit, orderBy: [...PEGAWAI_ORDER], select: PEGAWAI_SELECT }) as Promise<
        StrukturPegawai[]
      >,
      db().count({ where }),
    ]);

    return {
      success: true as const,
      message: `Berhasil mengambil daftar ${config.pegawaiLabelLower}`,
      data,
      page,
      limit,
      total,
      totalPages: totalPagesOf(total, limit),
    };
  }

  /** GET publik: detail satu pegawai; 404 bila tidak ada (atau sudah dihapus). */
  async function findUnique(context: Context) {
    const { id } = context.params as { id: string };
    const data = (await db().findUnique({
      where: { id, ...liveWhere(config) },
      select: PEGAWAI_SELECT,
    })) as StrukturPegawai | null;
    if (!data) return fail(context, 404, `${config.pegawaiLabel} tidak ditemukan`);
    return { success: true as const, message: `Berhasil mengambil ${config.pegawaiLabelLower}`, data };
  }

  return { findMany, findUnique };
}
