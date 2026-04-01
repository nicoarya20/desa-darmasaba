import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export default async function sejarahDesaFindFirst() {
    // ✅ Authentication check
    const authResult = await requireAuth();
    if (!authResult.authenticated) {
        return authResult.response;
    }

    try {
      // Get the first active record
      const data = await prisma.sejarahDesa.findFirst({
        where: {
          isActive: true,
        },
        orderBy: { createdAt: 'asc' } // Get the oldest one first
      });

      if (!data) {
        return Response.json({
          success: false,
          message: "Data tidak ditemukan",
        }, {status: 404})
      }

      return Response.json({
        success: true,
        data,
      }, {status: 200})
    } catch (error) {
      console.error("Gagal mengambil data sejarah desa:", error)
      return Response.json({
        success: false,
        message: "Terjadi kesalahan saat mengambil data",
      }, {status: 500})
    }
}
