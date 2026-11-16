import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { badRequest, guardAdminPenerima, notFound, validasiBodyPenerima } from "./penerima.body";

type BodyUpdate = { tahun?: unknown; nama?: unknown; alamat?: unknown; isActive?: unknown };

/** PUT /penerima/:id — ubah nama, alamat, tahun, dan status tampil satu penerima. */
export default async function penerimaUpdate(context: Context) {
  const ditolak = await guardAdminPenerima(context.set);
  if (ditolak) return ditolak;

  const id = String(context.params?.id ?? "");
  const body = (context.body ?? {}) as BodyUpdate;
  const v = validasiBodyPenerima(body);
  if (!v.ok) return badRequest(context.set, v.alasan);
  if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
    return badRequest(context.set, "isActive harus boolean");
  }

  const ada = await prisma.penerimaProgramKemiskinan.findUnique({ where: { id }, select: { id: true } });
  if (!ada) return notFound(context.set, "Penerima tidak ditemukan");

  const data = await prisma.penerimaProgramKemiskinan.update({
    where: { id },
    data: { ...v.value, ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}) },
    select: { id: true, nama: true, alamat: true, tahun: true, isActive: true, urutan: true },
  });
  return { success: true as const, message: "Penerima berhasil diperbarui", data };
}
