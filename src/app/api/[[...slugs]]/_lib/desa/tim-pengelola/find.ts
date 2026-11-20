import type { Context } from "elysia";
import prisma from "@/lib/prisma";
import { TIM_PENGELOLA_ID } from "@/lib/tim-pengelola";
import { FILE_SELECT } from "../dokumen-perencanaan/file-check";
import { PESAN_GAGAL_BACA_TIM_PENGELOLA } from "./tim-pengelola.guard";

/** Kolom publik (kontrak output; hanya boleh bertambah): nomor/tanggal SK dan tautan PDF. TANPA anggota. */
export const TIM_PENGELOLA_PUBLIC_SELECT = {
  id: true,
  nomorSk: true,
  tanggalSk: true,
  skFile: FILE_SELECT,
  updatedAt: true,
} as const;

/** GET publik (footer): nomor SK + tautan PDF; `data: null` (200) bila admin belum mengisi. Tidak pernah memuat anggota. */
export default async function timPengelolaFind(context: Context) {
  try {
    const data = await prisma.timPengelolaWebsite.findUnique({
      where: { id: TIM_PENGELOLA_ID },
      select: TIM_PENGELOLA_PUBLIC_SELECT,
    });
    return { success: true, message: data ? "Data ditemukan" : "Tim pengelola belum diisi", data };
  } catch (error) {
    console.error("Gagal mengambil tim pengelola website:", (error as Error).message);
    context.set.status = 500;
    return { success: false, message: PESAN_GAGAL_BACA_TIM_PENGELOLA };
  }
}
