import type { Context } from "elysia";
import prisma from "@/lib/prisma";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import { TIM_PENGELOLA_ID } from "@/lib/tim-pengelola";
import { TIM_PENGELOLA_PUBLIC_SELECT } from "./find";
import { PESAN_ADMIN_TIM_PENGELOLA, PESAN_GAGAL_BACA_TIM_PENGELOLA } from "./tim-pengelola.guard";

/** Kolom admin: kolom publik + anggota berurutan (nama dan jabatan saja). */
export const TIM_PENGELOLA_ADMIN_SELECT = {
  ...TIM_PENGELOLA_PUBLIC_SELECT,
  anggota: { select: { nama: true, jabatan: true }, orderBy: { urutan: "asc" } },
} as const;

/** GET admin (role 0-4): data tim lengkap dengan daftar anggota; `data: null` (200) bila belum diisi. */
export default async function timPengelolaFindAdmin(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_TIM_PENGELOLA);
  if (denied) return denied;

  try {
    const data = await prisma.timPengelolaWebsite.findUnique({
      where: { id: TIM_PENGELOLA_ID },
      select: TIM_PENGELOLA_ADMIN_SELECT,
    });
    return { success: true, message: data ? "Data ditemukan" : "Tim pengelola belum diisi", data };
  } catch (error) {
    console.error("Gagal mengambil tim pengelola website (admin):", (error as Error).message);
    context.set.status = 500;
    return { success: false, message: PESAN_GAGAL_BACA_TIM_PENGELOLA };
  }
}
