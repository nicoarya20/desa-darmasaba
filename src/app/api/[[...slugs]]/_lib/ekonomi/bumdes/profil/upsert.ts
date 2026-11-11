import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { IMAGE_SELECT, validationFailure, writeFailure } from "../http";
import { PROFIL_BUMDES_ID, profilBumDesSchema } from "./validation";

/** PUT (admin): buat/ubah profil BUMDes tunggal; field yang tidak dikirim dibiarkan, null/"" menghapus nilai. */
export default async function profilBumDesUpsert(context: Context) {
  const parsed = profilBumDesSchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);

  try {
    // deletedAt/isActive di-reset di update agar profil yang pernah dinonaktifkan tampil lagi setelah disimpan
    const data = await prisma.profilBumDes.upsert({
      where: { id: PROFIL_BUMDES_ID },
      create: { id: PROFIL_BUMDES_ID, ...parsed.data },
      update: { ...parsed.data, isActive: true, deletedAt: null },
      include: { image: IMAGE_SELECT },
    });
    return { success: true, message: "Profil BUMDes berhasil disimpan", data };
  } catch (error) {
    return writeFailure(error, context);
  }
}
