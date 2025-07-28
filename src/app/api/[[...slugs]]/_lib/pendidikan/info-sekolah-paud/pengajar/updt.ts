/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdatePengajar = {
  nama?: string;
  lembagaId?: string;
};

export default async function pengajarUpdate(context: Context) {
  const body = context.body as FormUpdatePengajar;

  const id = context.params.id;

  if (!id) {
    return {
      success: false,
      message: "ID pengajar wajib diisi",
    };
  }

  try {
    const updated = await prisma.pengajar.update({
      where: { id },
      data: {
        nama: body.nama,
        lembagaId: body.lembagaId,
      },
      include: {
        lembaga: true,
      },
    });

    return {
      success: true,
      message: "Pengajar berhasil diperbarui",
      data: updated,
    };
  } catch (error: any) {
    console.error("❌ Error update pengajar:", error);
    return {
      success: false,
      message: "Gagal memperbarui data pengajar",
      error: error.message,
    };
  }
}
