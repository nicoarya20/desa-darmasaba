import prisma from "@/lib/prisma";
import { toForeignKeyResponse } from "@/lib/prisma-error";
import { bankSampahBodySchema } from "@/lib/bank-sampah/bank-sampah.validation";
import { Context } from "elysia";
import { fail, validationFailure } from "../../../_struktur-organisasi/http";
import removeReleasedFiles from "../../../fileStorage/_lib/removeReleasedFiles";
import { BANK_SAMPAH_FILE_OWNER, dataBankSampah, inovasiValid, PESAN_INOVASI_TIDAK_VALID } from "./bank-sampah.data";

/**
 * PUT (admin): ubah bank sampah. Field detail yang tidak dikirim dibiarkan; `programInovasiIds` dikirim =
 * daftar pengganti. Foto bagan lama yang diganti/dikosongkan dihapus permanen setelah update sukses.
 */
export default async function keteranganBankSampahTerdekatUpdate(context: Context) {
  const id = (context.params as { id?: string })?.id;
  if (!id) return fail(context, 400, "ID keterangan bank sampah terdekat wajib diisi");

  const parsed = bankSampahBodySchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);
  const body = parsed.data;
  if (!(await inovasiValid(body.programInovasiIds))) return fail(context, 400, PESAN_INOVASI_TIDAK_VALID);

  const lama = await prisma.keteranganBankSampahTerdekat.findUnique({ where: { id }, select: { fotoBaganStrukturId: true } });
  if (!lama) return fail(context, 404, "Keterangan bank sampah terdekat tidak ditemukan");

  const inovasi = body.programInovasiIds
    ? { programInovasi: { set: body.programInovasiIds.map((inovasiId) => ({ id: inovasiId })) } }
    : {};
  try {
    const updated = await prisma.keteranganBankSampahTerdekat.update({
      where: { id },
      data: { ...dataBankSampah(body), ...inovasi },
    });
    await removeReleasedFiles(BANK_SAMPAH_FILE_OWNER, [lama.fotoBaganStrukturId], [updated.fotoBaganStrukturId]);
    return {
      success: true,
      message: "Success update keterangan bank sampah terdekat",
      data: updated,
    };
  } catch (error) {
    const foreignKey = toForeignKeyResponse(error);
    if (foreignKey) return fail(context, 400, foreignKey.message);
    console.error(`[banksampah] Gagal update bank sampah ${id}:`, error);
    return fail(context, 500, "Gagal mengupdate keterangan bank sampah terdekat");
  }
}
