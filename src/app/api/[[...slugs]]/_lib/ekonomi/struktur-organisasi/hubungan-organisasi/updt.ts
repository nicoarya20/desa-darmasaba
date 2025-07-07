/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdateHubungan = {
  id: string;
  atasanId?: string;
  bawahanId?: string;
  tipe?: string;
};

export default async function hubunganOrganisasiUpdate(context: Context) {
  const body = await context.body as FormUpdateHubungan;

  if (!body?.id) {
    return {
      success: false,
      message: "ID wajib diisi untuk update",
    };
  }

  try {
    const updated = await prisma.hubunganOrganisasi.update({
      where: { id: body.id },
      data: {
        atasanId: body.atasanId,
        bawahanId: body.bawahanId,
        tipe: body.tipe,
      },
    });

    return {
      success: true,
      message: "Hubungan organisasi berhasil diupdate",
      data: updated,
    };
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        success: false,
        message: "Relasi atasan-bawahan sudah ada",
      };
    }

    console.error("Error update hubungan organisasi:", error);
    return {
      success: false,
      message: "Gagal update data hubungan organisasi",
      error: error.message,
    };
  }
}
