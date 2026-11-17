import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";
import { PPID_FILE_SELECT, rejectUnknownPpidFile } from "../ppid-file";
import { toProfilLembagaData, type ProfilLembagaBody } from "./profil-lembaga.shape";

/** PUT admin: simpan profil lembaga PPID (perbarui baris aktif, atau buat bila belum ada); teks disanitasi di server. */
export default async function profilLembagaPPIDUpdate(context: Pick<Context, "body" | "set">) {
  const body = context.body as ProfilLembagaBody;

  const unknownFile = await rejectUnknownPpidFile(context.set, body.gambarAlurId);
  if (unknownFile) return unknownFile;

  try {
    const data = toProfilLembagaData(body);
    const existing = await prisma.profilLembagaPPID.findFirst({
      where: { isActive: true, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    const include = { gambarAlur: { select: PPID_FILE_SELECT } };
    const row = existing
      ? await prisma.profilLembagaPPID.update({ where: { id: existing.id }, data, include })
      : await prisma.profilLembagaPPID.create({ data, include });

    // Gambar alur lama dihapus permanen SETELAH relasi dipindah/dilepas (bukan sebelumnya: pola bug Maskot).
    if (existing?.gambarAlurId && existing.gambarAlurId !== row.gambarAlurId) {
      await removeStoredFile({ id: existing.gambarAlurId }, "ProfilLembagaPPID");
    }
    return { success: true, message: "Profil lembaga PPID berhasil disimpan", data: row };
  } catch (e) {
    console.error("profilLembagaPPIDUpdate: gagal menyimpan ProfilLembagaPPID", e);
    context.set.status = 500;
    return { success: false, message: "Gagal menyimpan profil lembaga PPID" };
  }
}
