import prisma from "@/lib/prisma";
import { cekUrutanIds, urutanBaru, urutanDariIndex } from "@/lib/konten-bersama/urutan.logic";
import type { Context } from "elysia";
import { fail, validationFailure, writeFailure } from "../_struktur-organisasi/http";
import removeReleasedFiles, { type FileIdRef } from "../fileStorage/_lib/removeReleasedFiles";
import { URUTAN_ANAK, type DaftarAnakConfig } from "./daftar-anak.config";

type Params = { id: string; itemId?: string };
type BarisBerkas = Record<string, FileIdRef>;

/**
 * Handler CRUD daftar anak satu induk (galeri foto / pengurus): list (publik), tambah, ubah, hapus permanen,
 * urutkan (admin, lewat guard global). Rute: `/:id/<path>` (id = induk) dan `/:id/<path>/:itemId`.
 */
export function createDaftarAnakHandlers(config: DaftarAnakConfig) {
  const db = config.delegate;
  const { label, labelLower, max } = config;
  const milikInduk = (parentId: string) => ({ [config.parentKey]: parentId });
  const fileSelect = Object.fromEntries(["id", ...config.fileFields].map((f) => [f, true]));
  const berkasDari = (row: BarisBerkas) => config.fileFields.map((f) => row[f]);

  /** Item milik induk beserta kolom berkasnya; null bila tidak ada. */
  async function findItem({ id, itemId }: Params): Promise<BarisBerkas | null> {
    return (await db().findFirst({ where: { id: itemId, ...milikInduk(id) }, select: fileSelect })) as BarisBerkas | null;
  }

  /** GET: semua item milik induk, urut tampil (dibatasi `max`). */
  async function list(context: Context) {
    const { id } = context.params as Params;
    const data = await db().findMany({ where: milikInduk(id), select: config.select, orderBy: URUTAN_ANAK, take: max });
    return { success: true as const, message: `Daftar ${labelLower} berhasil dimuat`, data };
  }

  /** POST: tambah beberapa item sekaligus, ditaruh setelah item terakhir; ditolak bila melewati batas. */
  async function create(context: Context) {
    const { id } = context.params as Params;
    const parsed = config.schemas.create.safeParse(context.body);
    if (!parsed.success) return validationFailure(context, parsed.error);
    const { items } = parsed.data;
    if (!(await config.parentExists(id))) return fail(context, 404, config.parentNotFound);

    const where = milikInduk(id);
    const [jumlah, agregat] = await Promise.all([
      db().count({ where }),
      db().aggregate({ where, _max: { urutan: true } }) as Promise<{ _max: { urutan: number | null } }>,
    ]);
    if (jumlah + items.length > max) {
      return fail(context, 400, `${label} maksimal ${max}; sisa slot ${Math.max(0, max - jumlah)}`);
    }

    const urutan = urutanBaru(agregat._max.urutan, items.length);
    try {
      const data = await prisma.$transaction(
        items.map((item, i) => db().create({ data: { ...item, ...where, urutan: urutan[i] }, select: config.select })),
      );
      return { success: true as const, message: `${data.length} ${labelLower} berhasil ditambahkan`, data };
    } catch (error) {
      return writeFailure(error, context);
    }
  }

  /** PUT: ubah sebagian field satu item; berkas lama yang diganti/dikosongkan dihapus permanen. */
  async function update(context: Context) {
    const params = context.params as Params;
    const parsed = config.schemas.update.safeParse(context.body);
    if (!parsed.success) return validationFailure(context, parsed.error);
    const lama = await findItem(params);
    if (!lama) return fail(context, 404, `${label} tidak ditemukan`);

    try {
      const data = await db().update({ where: { id: params.itemId }, data: parsed.data, select: config.select });
      const baru = { ...lama, ...(parsed.data as BarisBerkas) };
      await removeReleasedFiles(config.fileOwner, berkasDari(lama), berkasDari(baru));
      return { success: true as const, message: `${label} berhasil diperbarui`, data };
    } catch (error) {
      return writeFailure(error, context);
    }
  }

  /** DELETE: hapus permanen satu item beserta berkasnya (tanpa panel Sampah). */
  async function remove(context: Context) {
    const params = context.params as Params;
    const lama = await findItem(params);
    if (!lama) return fail(context, 404, `${label} tidak ditemukan`);
    await db().delete({ where: { id: params.itemId } });
    await removeReleasedFiles(config.fileOwner, berkasDari(lama));
    return { success: true as const, message: `${label} berhasil dihapus`, data: { id: params.itemId } };
  }

  /** PUT urutan: body memuat semua id item milik induk; urutan = posisi di daftar. */
  async function reorder(context: Context) {
    const { id } = context.params as Params;
    const parsed = config.schemas.reorder.safeParse(context.body);
    if (!parsed.success) return validationFailure(context, parsed.error);
    const { ids } = parsed.data;

    const aktif = (await db().findMany({ where: milikInduk(id), select: { id: true } })) as { id: string }[];
    const pesan = cekUrutanIds(ids, aktif.map((a) => a.id), labelLower);
    if (pesan) return fail(context, 400, pesan);

    await prisma.$transaction(
      urutanDariIndex(ids).map(({ id: itemId, urutan }) => db().update({ where: { id: itemId }, data: { urutan } })),
    );
    return { success: true as const, message: `Urutan ${labelLower} berhasil disimpan`, data: { ids } };
  }

  return { list, create, update, remove, reorder };
}

export type DaftarAnakHandlers = ReturnType<typeof createDaftarAnakHandlers>;
