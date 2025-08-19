/* eslint-disable @typescript-eslint/no-explicit-any */
// find-first.ts
import prisma from "@/lib/prisma";

async function polsekTerdekatFindFirst() {
  const where: any = { isActive: true };

  try {
    const data = await prisma.polsekTerdekat.findFirst({
      where,
      include: {
        layananPolsek: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: "Berhasil ambil polsek terdekat terbaru",
      data,
    };
  } catch (e) {
    console.error("Error di findFirst:", e);
    return {
      success: false,
      message: "Gagal ambil polsek terdekat terbaru",
    };
  }
}

export default polsekTerdekatFindFirst;