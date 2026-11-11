import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "../../../fileStorage/_lib/removeStoredFile";
import { fail, PEGAWAI_SELECT, validationFailure, writeFailure } from "../http";
import { posisiExists } from "./posisi-exists";
import { pegawaiBodySchema } from "./validation";

/**
 * PUT (admin): ubah pegawai; field kosong dikosongkan (null). Bila `imageId` diganti atau
 * dikosongkan, FileStorage + objek MinIO lama dihapus SETELAH update berhasil.
 */
export default async function pegawaiUpdate(context: Context) {
  const { id } = context.params as { id: string };
  const parsed = pegawaiBodySchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);
  const body = parsed.data;

  const existing = await prisma.perangkatDesa.findUnique({
    where: { id },
    select: { id: true, imageId: true, image: { select: { id: true, path: true, name: true } } },
  });
  if (!existing) return fail(context, 404, "Perangkat desa tidak ditemukan");

  if (!(await posisiExists(body.posisiId))) return fail(context, 400, "Jabatan tidak ditemukan");

  let data;
  try {
    data = await prisma.perangkatDesa.update({ where: { id }, data: body, select: PEGAWAI_SELECT });
  } catch (error) {
    return writeFailure(error, context);
  }

  // imageId undefined = tidak dikirim → gambar tidak berubah.
  const imageReplaced = body.imageId !== undefined && body.imageId !== existing.imageId;
  if (imageReplaced && existing.image) {
    await removeStoredFile(existing.image, `perangkat desa ${id}`);
  }

  return { success: true as const, message: "Perangkat desa berhasil diperbarui", data };
}
