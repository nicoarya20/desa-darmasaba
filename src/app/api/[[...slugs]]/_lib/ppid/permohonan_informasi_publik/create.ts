import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.PermohonanInformasiPublikGetPayload<{
  select: {
    name: true;
    nik: true;
    email: true;
    notelp: true;
    alamat: true;
    jenisInformasiDimintaId: true;
    caraMemperolehInformasiId: true;
    caraMemperolehSalinanInformasiId: true;
  };
}>;

export default async function permohonanInformasiPublikCreate(context: Context) {
  const body = context.body as FormCreate;

  // ========== VALIDASI NIK ==========
  if (body.nik && body.nik.length > 16) {
    return {
      success: false,
      status: 400,
      message: "Maksimal NIK adalah 16 angka",
    };
  }

  // ========== VALIDASI NOMOR TELEPON ==========
  if (body.notelp && body.notelp.length > 15) {
    return {
      success: false,
      status: 400,
      message: "Maksimal nomor telepon adalah 15 angka",
    };
  }

  await prisma.permohonanInformasiPublik.create({
    data: {
      name: body.name,
      nik: body.nik,
      email: body.email,
      notelp: body.notelp,
      alamat: body.alamat,
      jenisInformasiDimintaId: body.jenisInformasiDimintaId,
      caraMemperolehInformasiId: body.caraMemperolehInformasiId,
      caraMemperolehSalinanInformasiId: body.caraMemperolehSalinanInformasiId,
    },
  });

  return {
    success: true,
    message: "Permohonan Informasi Publik Berhasil Dibuat",
    data: { ...body },
  };
}
