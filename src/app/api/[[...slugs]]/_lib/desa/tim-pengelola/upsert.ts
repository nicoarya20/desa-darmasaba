import type { Context } from "elysia";
import prisma from "@/lib/prisma";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";
import { TIM_PENGELOLA_ID, parseTimPengelolaInput, toTanggalSkDate } from "@/lib/tim-pengelola";
import { checkPdfFile } from "../dokumen-perencanaan/file-check";
import { TIM_PENGELOLA_ADMIN_SELECT } from "./find-admin";
import { PESAN_ADMIN_TIM_PENGELOLA, PESAN_GAGAL_SIMPAN_TIM_PENGELOLA } from "./tim-pengelola.guard";

/**
 * PUT (admin) simpan satu-satunya baris Tim Pengelola beserta daftar anggotanya. Anggota diganti utuh dalam satu
 * transaksi (hapus semua + isi ulang) supaya urutan selalu konsisten. `skFileId`: tidak dikirim = PDF tetap, null =
 * lepas PDF, id baru = ganti PDF (harus PDF aktif). PDF lama dihapus permanen SESUDAH transaksi sukses.
 */
export default async function timPengelolaUpsert(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_TIM_PENGELOLA);
  if (denied) return denied;

  const parsed = parseTimPengelolaInput(context.body);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.message };
  }
  const { nomorSk, tanggalSk, skFileId, anggota } = parsed.data;

  const fileError = await checkPdfFile(skFileId);
  if (fileError) {
    context.set.status = 400;
    return { success: false, message: fileError };
  }

  try {
    const { data, fileLama } = await prisma.$transaction(async (tx) => {
      const existing = await tx.timPengelolaWebsite.findUnique({ where: { id: TIM_PENGELOLA_ID }, select: { skFileId: true } });
      const fields = { nomorSk, tanggalSk: toTanggalSkDate(tanggalSk) };
      await tx.timPengelolaWebsite.upsert({
        where: { id: TIM_PENGELOLA_ID },
        create: { id: TIM_PENGELOLA_ID, ...fields, skFileId: skFileId ?? null },
        update: skFileId === undefined ? fields : { ...fields, skFileId },
        select: { id: true },
      });
      await tx.anggotaTimPengelola.deleteMany({ where: { timId: TIM_PENGELOLA_ID } });
      if (anggota.length > 0) {
        await tx.anggotaTimPengelola.createMany({
          data: anggota.map((a, urutan) => ({ timId: TIM_PENGELOLA_ID, nama: a.nama, jabatan: a.jabatan, urutan })),
        });
      }
      const data = await tx.timPengelolaWebsite.findUniqueOrThrow({
        where: { id: TIM_PENGELOLA_ID },
        select: TIM_PENGELOLA_ADMIN_SELECT,
      });
      return { data, fileLama: existing?.skFileId ?? null };
    });

    if (skFileId !== undefined && fileLama && fileLama !== skFileId) {
      await removeStoredFile({ id: fileLama }, "TimPengelolaWebsite");
    }
    return { success: true, message: "Tim pengelola website berhasil disimpan", data };
  } catch (error) {
    console.error("Gagal menyimpan tim pengelola website:", (error as Error).message);
    context.set.status = 500;
    return { success: false, message: PESAN_GAGAL_SIMPAN_TIM_PENGELOLA };
  }
}
