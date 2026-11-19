import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import { parseIndeksDesaInput } from "@/lib/indeks-desa";
import { PESAN_ADMIN_INDEKS_DESA, PESAN_INDEKS_DESA_TAHUN_SUDAH_ADA } from "./indeks-desa.guard";
import { isTahunDipakai, isUniqueViolation } from "./indeks-desa.tahun";
import { INDEKS_DESA_SELECT } from "./find-many";

/** POST (admin) tambah data IDM satu tahun: tahun, skor IDM/IKS/IKE/IKL (0-1), status resmi, catatan opsional. Tahun ganda = 400. */
export default async function indeksDesaCreate(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_INDEKS_DESA);
  if (denied) return denied;

  const parsed = parseIndeksDesaInput(context.body as Record<string, unknown>);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.message };
  }
  if (await isTahunDipakai(parsed.data.tahun)) {
    context.set.status = 400;
    return { success: false, message: PESAN_INDEKS_DESA_TAHUN_SUDAH_ADA };
  }

  try {
    const data = await prisma.indeksDesa.create({ data: parsed.data, select: INDEKS_DESA_SELECT });
    return { success: true, message: "Data Indeks Desa berhasil ditambahkan", data };
  } catch (error) {
    // Dua admin menyimpan tahun yang sama bersamaan: pemeriksaan di atas lolos untuk keduanya, indeks unik menolak yang kedua.
    if (!isUniqueViolation(error)) {
      throw new Error(`Gagal menyimpan data Indeks Desa tahun ${parsed.data.tahun}: ${(error as Error).message}`, { cause: error });
    }
    context.set.status = 400;
    return { success: false, message: PESAN_INDEKS_DESA_TAHUN_SUDAH_ADA };
  }
}
