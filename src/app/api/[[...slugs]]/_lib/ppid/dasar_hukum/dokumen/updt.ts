import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import { PESAN_ADMIN_DOKUMEN, PESAN_DOKUMEN_TIDAK_ADA } from "./dokumen.guard";
import { validateJudulDokumen } from "./dokumen.rules";
import { DOKUMEN_AKTIF, DOKUMEN_DASAR_HUKUM_SELECT } from "./find-many";

/** PUT (admin) ubah judul satu dokumen; berkas dan urutan tidak berubah. */
export default async function dokumenDasarHukumUpdate(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_DOKUMEN);
  if (denied) return denied;

  const { id } = context.params as { id: string };
  const { judul: rawJudul } = context.body as { judul: string };
  const judul = validateJudulDokumen(rawJudul);
  if (!judul.ok) {
    context.set.status = 400;
    return { success: false, message: judul.message };
  }

  const existing = await prisma.dokumenDasarHukumPPID.findFirst({ where: { id, ...DOKUMEN_AKTIF }, select: { id: true } });
  if (!existing) {
    context.set.status = 404;
    return { success: false, message: PESAN_DOKUMEN_TIDAK_ADA };
  }

  const data = await prisma.dokumenDasarHukumPPID.update({
    where: { id },
    data: { judul: judul.judul },
    select: DOKUMEN_DASAR_HUKUM_SELECT,
  });
  return { success: true, message: "Judul dokumen berhasil diubah", data };
}
