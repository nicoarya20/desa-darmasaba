import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import { rejectUnknownPpidFile } from "../../ppid-file";
import { PESAN_ADMIN_DOKUMEN, PESAN_BERKAS_DOKUMEN_KOSONG } from "./dokumen.guard";
import { validateJudulDokumen } from "./dokumen.rules";
import { DOKUMEN_AKTIF, DOKUMEN_DASAR_HUKUM_SELECT } from "./find-many";

/** POST (admin) tambah satu dokumen: `judul` + `fileId` berkas PDF yang sudah diunggah; `urutan` otomatis = terakhir + 1. */
export default async function dokumenDasarHukumCreate(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_DOKUMEN);
  if (denied) return denied;

  const body = context.body as { judul: string; fileId: string };
  const judul = validateJudulDokumen(body.judul);
  if (!judul.ok) {
    context.set.status = 400;
    return { success: false, message: judul.message };
  }
  if (!body.fileId) {
    context.set.status = 400;
    return { success: false, message: PESAN_BERKAS_DOKUMEN_KOSONG };
  }
  const unknownFile = await rejectUnknownPpidFile(context.set, body.fileId);
  if (unknownFile) return unknownFile;

  const last = await prisma.dokumenDasarHukumPPID.aggregate({ where: DOKUMEN_AKTIF, _max: { urutan: true } });
  const data = await prisma.dokumenDasarHukumPPID.create({
    data: { judul: judul.judul, fileId: body.fileId, urutan: (last._max.urutan ?? -1) + 1 },
    select: DOKUMEN_DASAR_HUKUM_SELECT,
  });
  return { success: true, message: "Dokumen dasar hukum berhasil ditambahkan", data };
}
