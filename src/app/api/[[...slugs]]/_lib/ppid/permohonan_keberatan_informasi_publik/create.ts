import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.FormulirPermohonanKeberatanGetPayload<{
  select: {
    name: true;
    email: true;
    notelp: true;
    alasan: true;
  };
}>;

export default async function permohonanKeberatanInformasiPublikCreate(
  context: Context
) {
  const body = context.body as FormCreate;

  // ========== VALIDASI NOMOR TELEPON ==========
  if (body.notelp && body.notelp.length > 15) {
    return {
      success: false,
      status: 400,
      message: "Maksimal nomor telepon adalah 15 angka",
    };
  }

  await prisma.formulirPermohonanKeberatan.create({
    data: {
      name: body.name,
      email: body.email,
      notelp: body.notelp,
      alasan: body.alasan,
    },
  });

  return {
    success: true,
    message: "Permohonan Keberatan Informasi Publik Berhasil Dibuat",
    data: {
      ...body,
    },
  };
}
