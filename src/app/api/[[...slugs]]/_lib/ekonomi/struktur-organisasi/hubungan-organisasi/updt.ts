import prisma from "@/lib/prisma";
import { Context } from "elysia";

/* eslint-disable @typescript-eslint/no-explicit-any */
type FormUpdateHubungan = {
  atasanId?: string;
  bawahanId?: string;
  tipe?: string;
};

export default async function hubunganOrganisasiUpdate(context: Context) {
  const body = await context.body as Omit<FormUpdateHubungan, 'id'>;
  const id = context.params?.id;

  if (!id) {
    return {
      success: false,
      message: "ID wajib ada di URL",
    };
  }

  try {
    const updated = await prisma.hubunganOrganisasi.update({
      where: { id },
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
