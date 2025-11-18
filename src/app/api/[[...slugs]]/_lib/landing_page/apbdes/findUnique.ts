import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function apbdesFindUnique(context: Context) {
  // ✅ Parse URL secara manual
  const url = new URL(context.request.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);
  
  console.log("🔍 DEBUG INFO:");
  console.log("- Full URL:", context.request.url);
  console.log("- Pathname:", url.pathname);
  console.log("- Path segments:", pathSegments);
  
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
  
  const id = pathSegments[3]; // ✅ ID ada di index ke-3
  
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
          orderBy: { kode: 'asc' }
        },
        image: true,
        file: true
      }
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
      data: result,
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