import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import { parseLembagaKomunitasInput } from "@/lib/lembaga-komunitas";
import { PESAN_ADMIN_LEMBAGA_KOMUNITAS } from "./lembaga-komunitas.guard";
import { rejectInvalidFoto } from "./lembaga-komunitas.foto";
import { LEMBAGA_KOMUNITAS_SELECT } from "./find-many";

/** POST (admin) tambah lembaga: `nama`, `jenis` wajib; `ketua`, `deskripsi`, `kontak`, `urutan`, `fotoId` (gambar) opsional. */
export default async function lembagaKomunitasCreate(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_LEMBAGA_KOMUNITAS);
  if (denied) return denied;

  const parsed = parseLembagaKomunitasInput(context.body as Record<string, unknown>);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.message };
  }
  const { fields, fotoId } = parsed.data;
  const invalidFoto = await rejectInvalidFoto(context.set, fotoId);
  if (invalidFoto) return invalidFoto;

  try {
    const data = await prisma.lembagaKomunitas.create({
      data: { ...fields, fotoId: fotoId ?? null },
      select: LEMBAGA_KOMUNITAS_SELECT,
    });
    return { success: true, message: "Lembaga atau komunitas berhasil ditambahkan", data };
  } catch (error) {
    throw new Error(`Gagal menyimpan lembaga atau komunitas "${fields.nama}": ${(error as Error).message}`, { cause: error });
  }
}
