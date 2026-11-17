import prisma from "@/lib/prisma";
import { toPerpustakaanWebsite } from "@/lib/perpustakaan-website";
import type { Context } from "elysia";

/** GET publik: pengaturan aktif halaman penghubung Perpustakaan Digital (`data: null` bila belum diatur). */
export default async function perpustakaanPengaturanFind(context: Pick<Context, "set">) {
  try {
    const row = await prisma.perpustakaanConfig.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: toPerpustakaanWebsite(row) };
  } catch (e) {
    console.error("perpustakaanPengaturanFind: gagal membaca PerpustakaanConfig", e);
    context.set.status = 500;
    return { success: false, message: "Gagal mengambil pengaturan perpustakaan" };
  }
}
