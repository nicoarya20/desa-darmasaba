import { parseOptionalBoolean, validateParent, type HierarchyNode, type ParentValidation } from "@/lib/struktur-organisasi";
import { Context } from "elysia";
import { hardDeleteRow, liveCount, liveWhere, type StrukturApiConfig } from "./config";
import { fail, posisiSelect, validationFailure } from "./http";
import type { StrukturPosisi } from "./types";
import { posisiCreateSchema, posisiUpdateSchema } from "./validation";

type PosisiUsage = { id: string; _count: { pegawai: number; children: number } };

/** Handler jabatan (`/posisi*`) untuk satu struktur; semua respons berbentuk `{ success, message, data? }`. */
export function createPosisiHandlers(config: StrukturApiConfig) {
  const db = config.posisi;
  const live = () => liveWhere(config);
  const select = () => posisiSelect(config);

  /**
   * Validasi atasan terhadap seluruh bagan. Memuat hanya `id` + `parentId` semua jabatan (tabel kecil)
   * agar deteksi siklus cukup satu query; jabatan terhapus (soft-delete) tidak bisa jadi atasan.
   */
  async function checkParent(id: string | undefined, parentId: string | null | undefined): Promise<ParentValidation> {
    if (!parentId) return { ok: true };
    const nodes = (await db().findMany({ where: live(), select: { id: true, parentId: true } })) as HierarchyNode[];
    return validateParent({ id, parentId, nodes });
  }

  /** GET publik: semua jabatan (opsional filter `isActive`), urut hierarki, urutan, nama. */
  async function findManyAll(context: Context) {
    const isActive = parseOptionalBoolean(context.query?.isActive);
    const data = (await db().findMany({
      where: isActive === undefined ? live() : { ...live(), isActive },
      orderBy: [{ hierarki: "asc" }, { urutan: "asc" }, { nama: "asc" }],
      select: select(),
    })) as StrukturPosisi[];
    return { success: true as const, message: "Berhasil mengambil daftar jabatan", data };
  }

  /** GET publik: detail satu jabatan; 404 bila tidak ada. */
  async function findUnique(context: Context) {
    const { id } = context.params as { id: string };
    const data = (await db().findUnique({ where: { id, ...live() }, select: select() })) as StrukturPosisi | null;
    if (!data) return fail(context, 404, "Jabatan tidak ditemukan");
    return { success: true as const, message: "Berhasil mengambil jabatan", data };
  }

  /** POST (admin): tambah jabatan; 400 bila body tidak valid atau atasan tidak ada. */
  async function create(context: Context) {
    const parsed = posisiCreateSchema.safeParse(context.body);
    if (!parsed.success) return validationFailure(context, parsed.error);
    const { nama, hierarki, deskripsi, urutan, parentId } = parsed.data;

    const parent = await checkParent(undefined, parentId);
    if (!parent.ok) return fail(context, 400, parent.message);

    const data = (await db().create({
      data: { nama, hierarki, deskripsi: deskripsi ?? null, urutan: urutan ?? 0, parentId: parentId ?? null },
      select: select(),
    })) as StrukturPosisi;
    return { success: true as const, message: "Jabatan berhasil ditambahkan", data };
  }

  /** PUT (admin): ubah jabatan; 404 bila tidak ada, 400 bila atasan tidak ada / diri sendiri / siklus. */
  async function update(context: Context) {
    const { id } = context.params as { id: string };
    const parsed = posisiUpdateSchema.safeParse(context.body);
    if (!parsed.success) return validationFailure(context, parsed.error);

    const existing = await db().findUnique({ where: { id, ...live() }, select: { id: true } });
    if (!existing) return fail(context, 404, "Jabatan tidak ditemukan");

    const parent = await checkParent(id, parsed.data.parentId);
    if (!parent.ok) return fail(context, 400, parent.message);

    // Field yang tidak dikirim (undefined) dibiarkan; string kosong sudah menjadi null.
    const data = (await db().update({ where: { id }, data: parsed.data, select: select() })) as StrukturPosisi;
    return { success: true as const, message: "Jabatan berhasil diperbarui", data };
  }

  /** DELETE (admin): hapus jabatan; 404 bila tidak ada, 409 bila masih punya pegawai atau jabatan bawahan. */
  async function remove(context: Context) {
    const { id } = context.params as { id: string };
    const existing = (await db().findUnique({
      where: { id, ...live() },
      select: { id: true, _count: { select: { pegawai: liveCount(config), children: liveCount(config) } } },
    })) as PosisiUsage | null;
    if (!existing) return fail(context, 404, "Jabatan tidak ditemukan");

    const { pegawai, children } = existing._count;
    if (pegawai > 0) {
      return fail(context, 409, `Jabatan masih dipakai ${pegawai} pegawai; pindahkan atau hapus pegawainya dulu`);
    }
    if (children > 0) {
      return fail(context, 409, `Jabatan masih punya ${children} jabatan bawahan; ubah atasan jabatan tersebut dulu`);
    }

    if (config.softDelete) {
      await db().update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    } else {
      await hardDeleteRow(config, "posisi", id);
    }
    return { success: true as const, message: "Jabatan berhasil dihapus", data: { id } };
  }

  return { findManyAll, findUnique, create, update, delete: remove };
}

export type PosisiHandlers = ReturnType<typeof createPosisiHandlers>;
