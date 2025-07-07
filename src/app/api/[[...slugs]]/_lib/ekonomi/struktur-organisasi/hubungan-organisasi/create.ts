/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreateHubunganOrganisasi = {
  atasanId: string;
  bawahanId: string;
  tipe?: string;
};

export default async function hubunganOrganisasiCreate(context: Context) {
  const body = await context.body as FormCreateHubunganOrganisasi;

  // Validasi minimal
  if (!body || !body.atasanId || !body.bawahanId) {
    return {
      success: false,
      message: "atasanId dan bawahanId wajib diisi",
    };
  }

  try {
    const data = await prisma.hubunganOrganisasi.create({
      data: {
        atasanId: body.atasanId,
        bawahanId: body.bawahanId,
        tipe: body.tipe,
      },
    });

    return {
      success: true,
      message: "Berhasil membuat hubungan organisasi",
      data,
    };
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        success: false,
        message: "Hubungan antara atasan dan bawahan sudah ada",
      };
    }

    console.error("Error create hubungan organisasi:", error);
    return {
      success: false,
      message: "Gagal membuat hubungan organisasi",
      error: error.message,
    };
  }
}
