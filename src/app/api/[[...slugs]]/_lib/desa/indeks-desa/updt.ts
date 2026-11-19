import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import { parseIndeksDesaInput } from "@/lib/indeks-desa";
import { PESAN_ADMIN_INDEKS_DESA, PESAN_INDEKS_DESA_TAHUN_SUDAH_ADA, PESAN_INDEKS_DESA_TIDAK_ADA } from "./indeks-desa.guard";
import { isTahunDipakai, isUniqueViolation } from "./indeks-desa.tahun";
import { INDEKS_DESA_AKTIF, INDEKS_DESA_SELECT } from "./find-many";

/** PUT (admin) ubah data IDM satu tahun; tahun boleh diganti selama belum dipakai baris lain (ganda = 400). */
export default async function indeksDesaUpdate(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_INDEKS_DESA);
  if (denied) return denied;

  const { id } = context.params as { id: string };
  const parsed = parseIndeksDesaInput(context.body as Record<string, unknown>);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.message };
  }

  const existing = await prisma.indeksDesa.findFirst({ where: { id, ...INDEKS_DESA_AKTIF }, select: { id: true } });
  if (!existing) {
    context.set.status = 404;
    return { success: false, message: PESAN_INDEKS_DESA_TIDAK_ADA };
  }
  if (await isTahunDipakai(parsed.data.tahun, id)) {
    context.set.status = 400;
    return { success: false, message: PESAN_INDEKS_DESA_TAHUN_SUDAH_ADA };
  }

  try {
    const data = await prisma.indeksDesa.update({ where: { id }, data: parsed.data, select: INDEKS_DESA_SELECT });
    return { success: true, message: "Data Indeks Desa berhasil diubah", data };
  } catch (error) {
    // Balapan dua penyimpanan ke tahun yang sama: lihat komentar di create.ts.
    if (!isUniqueViolation(error)) {
      throw new Error(`Gagal menyimpan data Indeks Desa tahun ${parsed.data.tahun}: ${(error as Error).message}`, { cause: error });
    }
    context.set.status = 400;
    return { success: false, message: PESAN_INDEKS_DESA_TAHUN_SUDAH_ADA };
  }
}
