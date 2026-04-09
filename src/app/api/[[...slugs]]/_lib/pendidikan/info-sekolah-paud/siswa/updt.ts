/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormUpdateSiswaDesa = {
  nama?: string;
  lembagaId?: string;
};

export default async function siswaUpdate(context: Context) {
  const body = context.body as FormUpdateSiswaDesa;

  const id = context.params.id;

  if (!id) {
    return {
      success: false,
      message: "ID siswa wajib diisi",
    };
  }

  try {
    const updated = await prisma.siswa.update({
      where: { id },
      data: {
        nama: body.nama,
        lembagaId: body.lembagaId,
        updatedAt: new Date(),
      },
      include: {
        lembaga: true,
      },
    });

    return {
      success: true,
      message: "Siswa berhasil diperbarui",
      data: updated,
    };
  } catch (error: any) {
    console.error("❌ Error update siswa:", error);
    return {
      success: false,
      message: "Gagal memperbarui data siswa",
      error: error.message,
    };
  }
}
