import type { Context } from "elysia";
import prisma from "@/lib/prisma";
import { KONTAK_DESA_ID } from "@/lib/kontak-desa";
import { PESAN_GAGAL_BACA_KONTAK_DESA } from "./kontak-desa.guard";

/** Kolom yang diekspos ke klien (kontrak output; hanya boleh bertambah). */
export const KONTAK_DESA_SELECT = {
  id: true,
  namaKantor: true,
  alamat: true,
  telepon: true,
  email: true,
  updatedAt: true,
} as const;

/** GET publik (footer & PPID): kontak desa; `data: null` (200) bila barisnya belum ada. */
export default async function kontakDesaFind(context: Context) {
  try {
    const data = await prisma.kontakDesa.findUnique({ where: { id: KONTAK_DESA_ID }, select: KONTAK_DESA_SELECT });
    return { success: true, message: data ? "Data ditemukan" : "Kontak desa belum diisi", data };
  } catch (error) {
    console.error("Gagal mengambil kontak desa:", (error as Error).message);
    context.set.status = 500;
    return { success: false, message: PESAN_GAGAL_BACA_KONTAK_DESA };
  }
}
