import prisma from "@/lib/prisma";
import { perpustakaanWebsiteSchema, toPerpustakaanWebsite } from "@/lib/perpustakaan-website";
import type { Context } from "elysia";

/** PUT admin: simpan pengaturan halaman penghubung (perbarui baris aktif, atau buat bila belum ada). */
export default async function perpustakaanPengaturanUpdate(context: Pick<Context, "body" | "set">) {
  const parsed = perpustakaanWebsiteSchema.safeParse(context.body);
  if (!parsed.success) {
    context.set.status = 400;
    return { success: false, message: parsed.error.issues.map((issue) => issue.message).join("; ") };
  }

  try {
    const existing = await prisma.perpustakaanConfig.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    const row = existing
      ? await prisma.perpustakaanConfig.update({ where: { id: existing.id }, data: parsed.data })
      : await prisma.perpustakaanConfig.create({ data: parsed.data });
    return { success: true, message: "Pengaturan perpustakaan berhasil disimpan", data: toPerpustakaanWebsite(row) };
  } catch (e) {
    console.error("perpustakaanPengaturanUpdate: gagal menyimpan PerpustakaanConfig", e);
    context.set.status = 500;
    return { success: false, message: "Gagal menyimpan pengaturan perpustakaan" };
  }
}
