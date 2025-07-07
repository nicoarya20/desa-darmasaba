/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";

export default async function hubunganOrganisasiFindMany() {
  try {
    const data = await prisma.hubunganOrganisasi.findMany({
      include: {
        atasan: true,
        bawahan: true,
      },
      orderBy: {
        atasanId: "asc",
      },
    });

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error findMany hubungan organisasi:", error);
    return {
      success: false,
      message: "Gagal mengambil data hubungan organisasi",
      error: error.message,
    };
  }
}
