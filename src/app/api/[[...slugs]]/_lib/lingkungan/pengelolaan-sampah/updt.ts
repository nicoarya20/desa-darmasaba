/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormUpdatePengelolaanSampah = {
  id: string;
  name?: string;
  icon?: string;
};
export default async function pengelolaanSampahUpdate(context: Context) {
  const body = context.body as FormUpdatePengelolaanSampah;
  const id = context.params?.id; // ambil dari URL param

  if (!id) {
    return {
      success: false,
      message: "ID pengelolaan sampah wajib diisi",
    };
  }

  try {
    const updated = await prisma.pengelolaanSampah.update({
      where: { id },
      data: {
        name: body.name,
        icon: body.icon,
      },
    });

    return {
      success: true,
      message: "Pengelolaan sampah berhasil diupdate",
      data: updated,
    };
  } catch (error: any) {
    console.error("Error update pengelolaan sampah:", error);
    return {
      success: false,
      message: "Gagal mengupdate pengelolaan sampah",
      error: error.message,
    };
  }
}

