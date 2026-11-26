import prisma from "@/lib/prisma";
import { toHargaPublik } from "@/lib/umkm/harga-publik";
import type { Context } from "elysia";

/** GET publik: apakah harga produk UMKM disembunyikan di website publik (tanpa baris = tampil). */
export default async function umkmHargaPublikFind(context: Pick<Context, "set">) {
  try {
    const row = await prisma.umkmConfig.findFirst({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
    return { success: true, data: toHargaPublik(row) };
  } catch (e) {
    console.error("umkmHargaPublikFind: gagal membaca UmkmConfig", e);
    context.set.status = 500;
    return { success: false, message: "Gagal mengambil pengaturan harga produk" };
  }
}
