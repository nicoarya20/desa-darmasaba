import prisma from "@/lib/prisma";
import { parseOptionalBoolean } from "@/lib/struktur-organisasi";
import { Context } from "elysia";
import { POSISI_SELECT } from "../http";

/** GET publik: semua jabatan (opsional filter `isActive`), urut hierarki, urutan, nama. */
export default async function posisiFindManyAll(context: Context) {
  const isActive = parseOptionalBoolean(context.query?.isActive);
  const data = await prisma.posisiPerangkatDesa.findMany({
    where: isActive === undefined ? {} : { isActive },
    orderBy: [{ hierarki: "asc" }, { urutan: "asc" }, { nama: "asc" }],
    select: POSISI_SELECT,
  });
  return { success: true as const, message: "Berhasil mengambil daftar jabatan", data };
}
