import type { Context } from "elysia";
import prisma from "@/lib/prisma";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import { KONTAK_DESA_ID, parseKontakDesaInput } from "@/lib/kontak-desa";
import { KONTAK_DESA_SELECT } from "./find";
import { PESAN_ADMIN_KONTAK_DESA, PESAN_GAGAL_SIMPAN_KONTAK_DESA } from "./kontak-desa.guard";

/** PUT (admin) simpan satu-satunya baris kontak desa; idempoten (buat bila belum ada, selain itu perbarui). */
export default async function kontakDesaUpsert(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_KONTAK_DESA);
  if (denied) return denied;

  const parsed = parseKontakDesaInput(context.body);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.message };
  }

  try {
    const data = await prisma.kontakDesa.upsert({
      where: { id: KONTAK_DESA_ID },
      create: { id: KONTAK_DESA_ID, ...parsed.data },
      update: parsed.data,
      select: KONTAK_DESA_SELECT,
    });
    return { success: true, message: "Kontak desa berhasil disimpan", data };
  } catch (error) {
    console.error("Gagal menyimpan kontak desa:", (error as Error).message);
    context.set.status = 500;
    return { success: false, message: PESAN_GAGAL_SIMPAN_KONTAK_DESA };
  }
}
