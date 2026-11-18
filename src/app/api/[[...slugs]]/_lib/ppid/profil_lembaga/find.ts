import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { PPID_FILE_SELECT } from "../ppid-file";

/** GET publik: profil lembaga PPID aktif (beserta gambar alur); `data: null` bila admin belum mengisinya. */
export default async function profilLembagaPPIDFind(context: Pick<Context, "set">) {
  try {
    const data = await prisma.profilLembagaPPID.findFirst({
      where: { isActive: true, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { gambarAlur: { select: PPID_FILE_SELECT } },
    });
    return { success: true, data };
  } catch (e) {
    console.error("profilLembagaPPIDFind: gagal membaca ProfilLembagaPPID", e);
    context.set.status = 500;
    return { success: false, message: "Gagal mengambil profil lembaga PPID" };
  }
}
