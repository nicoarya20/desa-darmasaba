import prisma from "@/lib/prisma";
import { APBDES_DOKUMEN_INCLUDE, toApbdesDokumenView } from "@/lib/apbdes-dokumen-view";
import { Context } from "elysia";

export default async function apbdesFindUnique(context: Context) {
  const url = new URL(context.request.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);

  // Expected: ['api', 'landingpage', 'apbdes', 'ID']
  if (pathSegments.length < 4) {
    context.set.status = 400;
    return {
      success: false,
      message: "Route tidak valid. Format: /api/landingpage/apbdes/:id",
      debug: { pathSegments }
    };
  }

  if (pathSegments[0] !== 'api' ||
      pathSegments[1] !== 'landingpage' ||
      pathSegments[2] !== 'apbdes') {
    context.set.status = 400;
    return {
      success: false,
      message: "Route tidak valid",
      debug: { pathSegments }
    };
  }

  const id = pathSegments[3];

  if (!id || id.trim() === '') {
    context.set.status = 400;
    return {
      success: false,
      message: "ID APBDes diperlukan",
    };
  }

  try {
    const result = await prisma.aPBDes.findUnique({
      where: { id },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { kode: 'asc' },
          include: {
            realisasiItems: {
              where: { isActive: true },
              orderBy: { tanggal: 'asc' },
            },
          },
        },
        image: true,
        file: true,
        ...APBDES_DOKUMEN_INCLUDE,
      },
    });

    if (!result || !result.isActive) {
      context.set.status = 404;
      return {
        success: false,
        message: "Data APBDes tidak ditemukan atau tidak aktif",
      };
    }

    return {
      success: true,
      data: toApbdesDokumenView(result), // { ..., folders: [{ ..., dokumen }], dokumenUmum }
    };
  } catch (error) {
    console.error("❌ Error in apbdesFindUnique:", error);
    context.set.status = 500;
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data APBDes",
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    };
  }
}