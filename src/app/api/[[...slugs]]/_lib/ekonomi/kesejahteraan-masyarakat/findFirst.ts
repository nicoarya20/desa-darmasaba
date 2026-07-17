/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";

async function kesejahteraanFindFirst() {
  const where: any = { isActive: true };

  try {
    const data = await prisma.kesejahteraanMasyarakat.findFirst({
      where,
      include: {
        image: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      message: "Berhasil ambil program kesejahteraan terbaru",
      data,
    };
  } catch (e) {
    console.error("Error di findFirst:", e);
    return {
      success: false,
      message: "Gagal ambil program kesejahteraan terbaru",
    };
  }
}

export default kesejahteraanFindFirst;
