import { Context } from "elysia";
import removeStoredFile, { type StoredFileRef } from "../fileStorage/_lib/removeStoredFile";
import { hardDeleteRow, liveWhere, type StrukturApiConfig } from "./config";
import { fail, PEGAWAI_SELECT, validationFailure, writeFailure } from "./http";
import type { StrukturPegawai } from "./types";
import { pegawaiBodySchema } from "./validation";

type PegawaiFile = { id: string; imageId: string | null; image: StoredFileRef | null };
const FILE_SELECT = { id: true, imageId: true, image: { select: { id: true, path: true, name: true } } } as const;

/** Handler tulis pegawai (admin) untuk satu struktur: tambah, ubah, hapus (beserta foto). */
export function createPegawaiWriteHandlers(config: StrukturApiConfig) {
  const db = config.pegawai;
  const owner = (id: string) => `${config.pegawaiLabelLower} ${id}`;

  /** True bila jabatan ada (dan belum dihapus) — cek sebelum tulis agar 400 jelas, bukan FK error. */
  async function posisiExists(posisiId: string): Promise<boolean> {
    const posisi = await config.posisi().findUnique({ where: { id: posisiId, ...liveWhere(config) }, select: { id: true } });
    return posisi !== null;
  }

  /** Pegawai beserta foto tersimpannya; null bila tidak ada atau sudah dihapus. */
  async function findWithFile(id: string): Promise<PegawaiFile | null> {
    return (await db().findUnique({ where: { id, ...liveWhere(config) }, select: FILE_SELECT })) as PegawaiFile | null;
  }

  /** POST (admin): tambah pegawai; hanya nama + jabatan wajib, field opsional kosong disimpan null. */
  async function create(context: Context) {
    const parsed = pegawaiBodySchema.safeParse(context.body);
    if (!parsed.success) return validationFailure(context, parsed.error);
    const body = parsed.data;

    if (!(await posisiExists(body.posisiId))) return fail(context, 400, "Jabatan tidak ditemukan");

    try {
      const data = (await db().create({
        data: {
          namaLengkap: body.namaLengkap,
          posisiId: body.posisiId,
          gelarAkademik: body.gelarAkademik ?? null,
          imageId: body.imageId ?? null,
          tanggalMasuk: body.tanggalMasuk ?? null,
          email: body.email ?? null,
          telepon: body.telepon ?? null,
          alamat: body.alamat ?? null,
          isActive: body.isActive ?? true,
        },
        select: PEGAWAI_SELECT,
      })) as StrukturPegawai;
      return { success: true as const, message: `${config.pegawaiLabel} berhasil ditambahkan`, data };
    } catch (error) {
      return writeFailure(error, context);
    }
  }

  /**
   * PUT (admin): ubah pegawai; field kosong dikosongkan (null), field tidak dikirim dibiarkan. Bila `imageId`
   * diganti atau dikosongkan, FileStorage + objek MinIO lama dihapus SETELAH update berhasil.
   */
  async function update(context: Context) {
    const { id } = context.params as { id: string };
    const parsed = pegawaiBodySchema.safeParse(context.body);
    if (!parsed.success) return validationFailure(context, parsed.error);
    const body = parsed.data;

    const existing = await findWithFile(id);
    if (!existing) return fail(context, 404, `${config.pegawaiLabel} tidak ditemukan`);

    if (!(await posisiExists(body.posisiId))) return fail(context, 400, "Jabatan tidak ditemukan");

    let data: StrukturPegawai;
    try {
      data = (await db().update({ where: { id }, data: body, select: PEGAWAI_SELECT })) as StrukturPegawai;
    } catch (error) {
      return writeFailure(error, context);
    }

    // imageId undefined = tidak dikirim → gambar tidak berubah.
    const imageReplaced = body.imageId !== undefined && body.imageId !== existing.imageId;
    if (imageReplaced && existing.image) await removeStoredFile(existing.image, owner(id));

    return { success: true as const, message: `${config.pegawaiLabel} berhasil diperbarui`, data };
  }

  /**
   * DELETE (admin): hapus pegawai. Hard-delete: baris dihapus lalu fotonya (FileStorage + MinIO).
   * Soft-delete: `deletedAt` diisi + nonaktif; foto dibiarkan karena baris masih merujuknya.
   */
  async function remove(context: Context) {
    const { id } = context.params as { id: string };
    const existing = await findWithFile(id);
    if (!existing) return fail(context, 404, `${config.pegawaiLabel} tidak ditemukan`);

    if (config.softDelete) {
      await db().update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    } else {
      await hardDeleteRow(config, "pegawai", id);
      if (existing.image) await removeStoredFile(existing.image, owner(id));
    }
    return { success: true as const, message: `${config.pegawaiLabel} berhasil dihapus`, data: { id } };
  }

  return { create, update, delete: remove };
}
