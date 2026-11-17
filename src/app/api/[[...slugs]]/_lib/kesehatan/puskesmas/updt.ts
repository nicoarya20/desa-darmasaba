import prisma from "@/lib/prisma";
import { toForeignKeyResponse } from "@/lib/prisma-error";
import { pustuBodySchema } from "@/lib/pustu/pustu.validation";
import { Context } from "elysia";
import { fail, validationFailure } from "../../_struktur-organisasi/http";
import removeReleasedFiles from "../../fileStorage/_lib/removeReleasedFiles";
import { PUSTU_FILE_OWNER, PUSTU_RINGKAS_SELECT, dataJam, dataKontak, dataPustu, keRingkas, ubahGambar } from "./pustu.data";

/**
 * PUT (admin): ubah PUSTU. Field opsional yang tidak dikirim dibiarkan; jam & kontak diubah lewat relasinya.
 * Foto lokasi / bagan lama yang diganti atau dikosongkan dihapus permanen setelah update sukses.
 */
export default async function puskesmasUpdate(context: Context) {
  const id = (context.params as { id?: string })?.id;
  if (!id) return fail(context, 400, "ID PUSTU wajib diisi");

  const parsed = pustuBodySchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);
  const body = parsed.data;

  const lama = await prisma.puskesmas.findUnique({ where: { id }, select: { imageId: true, fotoBaganStrukturId: true } });
  if (!lama) return fail(context, 404, "PUSTU tidak ditemukan");

  try {
    const updated = await prisma.puskesmas.update({
      where: { id },
      data: {
        ...dataPustu(body),
        image: ubahGambar(body.imageId),
        fotoBaganStruktur: ubahGambar(body.fotoBaganStrukturId),
        ...(body.jadwal !== undefined && { jam: { update: dataJam(body) } }),
        ...(body.kontak !== undefined && { kontak: { update: dataKontak(body) } }),
      },
      select: { ...PUSTU_RINGKAS_SELECT, fotoBaganStrukturId: true },
    });
    await removeReleasedFiles(
      PUSTU_FILE_OWNER,
      [lama.imageId, lama.fotoBaganStrukturId],
      [updated.imageId, updated.fotoBaganStrukturId],
    );
    const { fotoBaganStrukturId, ...ringkas } = updated;
    return { success: true, message: "PUSTU berhasil diperbarui", data: { ...keRingkas(ringkas), fotoBaganStrukturId } };
  } catch (error) {
    const foreignKey = toForeignKeyResponse(error);
    if (foreignKey) return fail(context, 400, foreignKey.message);
    console.error(`[pustu] Gagal update PUSTU ${id}:`, error);
    return fail(context, 500, "Gagal memperbarui PUSTU");
  }
}
