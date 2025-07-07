/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";

export default async function pegawaiFindMany() {
  try {
    const pegawaiList = await prisma.pegawai.findMany({
      where: { isActive: true }, // Using the correct field name from Prisma model
      orderBy: { createdAt: "desc" },
      include: {
        posisi: true,
        image: true,
      },
    });

    return {
      success: true,
      data: pegawaiList,
    };
  } catch (error: any) {
    console.error("Error findMany pegawai:", error);
    return {
      success: false,
      message: "Gagal mengambil data pegawai",
      error: error.message,
    };
  }
}
