import prisma from "@/lib/prisma";
import { PPID_FILE_SELECT } from "../../ppid-file";
import { DOKUMEN_DASAR_HUKUM_MAX } from "./dokumen.rules";

/** Kolom dokumen Dasar Hukum yang dikirim ke klien (berkas: id, link, realName; tanpa path internal). */
export const DOKUMEN_DASAR_HUKUM_SELECT = {
  id: true,
  judul: true,
  urutan: true,
  file: { select: PPID_FILE_SELECT },
} as const;

/** Filter dokumen yang tampil: aktif dan belum dihapus. */
export const DOKUMEN_AKTIF = { isActive: true, deletedAt: null } as const;

/** GET publik daftar dokumen Dasar Hukum aktif, urut `urutan` naik lalu `createdAt`. */
export default async function dokumenDasarHukumFindMany() {
  const data = await prisma.dokumenDasarHukumPPID.findMany({
    where: DOKUMEN_AKTIF,
    orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
    take: DOKUMEN_DASAR_HUKUM_MAX,
    select: DOKUMEN_DASAR_HUKUM_SELECT,
  });
  return { success: true, data };
}
