import prisma from "@/lib/prisma";
import { hargaPublikSchema, toHargaPublik } from "@/lib/umkm/harga-publik";
import type { Context } from "elysia";

/** PUT admin: simpan saklar sembunyikan harga (perbarui baris aktif, atau buat bila belum ada). */
export default async function umkmHargaPublikUpdate(context: Pick<Context, "body" | "set">) {
  const parsed = hargaPublikSchema.safeParse(context.body);
  if (!parsed.success) {
    context.set.status = 400;
    return { success: false, message: parsed.error.issues.map((issue) => issue.message).join("; ") };
  }

  try {
    const existing = await prisma.umkmConfig.findFirst({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
    const row = existing
      ? await prisma.umkmConfig.update({ where: { id: existing.id }, data: parsed.data })
      : await prisma.umkmConfig.create({ data: parsed.data });
    const data = toHargaPublik(row);
    const message = data.sembunyikanHarga
      ? "Harga produk disembunyikan di website publik"
      : "Harga produk ditampilkan di website publik";
    return { success: true, message, data };
  } catch (e) {
    console.error("umkmHargaPublikUpdate: gagal menyimpan UmkmConfig", e);
    context.set.status = 500;
    return { success: false, message: "Gagal menyimpan pengaturan harga produk" };
  }
}
