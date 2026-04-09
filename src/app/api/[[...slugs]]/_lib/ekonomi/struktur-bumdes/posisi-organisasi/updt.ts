import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormUpdate = {
  id: string;
  nama: string;
  deskripsi: string;
  hierarki: number;
};

export default async function posisiOrganisasiUpdate(context: Context) {
  const body = context.body as FormUpdate;
  const id = context.params?.id as string;

  if (!id) {
    return {
      success: false,
      message: "ID is required",
    };
  }

  try {
    await prisma.posisiOrganisasiBumDes.update({
      where: { id },
      data: {
        nama: body.nama,
        deskripsi: body.deskripsi,
        hierarki: body.hierarki,
      },
    });

    const updated = await prisma.posisiOrganisasiBumDes.findUnique({
      where: { id },
    });

    return {
      success: true,
      message: "Success update posisi organisasi",
      data: updated,
    };
  } catch (error) {
    console.error("Update error:", error);
    return {
      success: false,
      message: "Gagal update posisi organisasi",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
