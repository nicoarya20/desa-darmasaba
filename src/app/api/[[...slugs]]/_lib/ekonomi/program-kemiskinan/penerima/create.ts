import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { badRequest, guardAdminPenerima, notFound, programAda, validasiBodyPenerima } from "./penerima.body";

type BodyCreate = { programId?: string; tahun?: unknown; nama?: unknown; alamat?: unknown };

/** POST /penerima/create — tambah satu penerima manual; diletakkan di akhir urutan tahun tersebut. */
export default async function penerimaCreate(context: Context) {
  const ditolak = await guardAdminPenerima(context.set);
  if (ditolak) return ditolak;

  const body = (context.body ?? {}) as BodyCreate;
  const v = validasiBodyPenerima(body);
  if (!v.ok) return badRequest(context.set, v.alasan);
  const programId = String(body.programId ?? "").trim();
  if (!(await programAda(programId))) return notFound(context.set, "Program tidak ditemukan");

  const terakhir = await prisma.penerimaProgramKemiskinan.aggregate({
    where: { programId, tahun: v.value.tahun },
    _max: { urutan: true },
  });
  const data = await prisma.penerimaProgramKemiskinan.create({
    data: { programId, ...v.value, urutan: (terakhir._max.urutan ?? -1) + 1 },
    select: { id: true, nama: true, alamat: true, tahun: true, isActive: true, urutan: true },
  });
  return { success: true as const, message: "Penerima berhasil ditambahkan", data };
}
