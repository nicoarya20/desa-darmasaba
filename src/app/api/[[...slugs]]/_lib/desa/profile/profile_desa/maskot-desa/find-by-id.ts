import prisma from "@/lib/prisma";

export default async function maskotDesaFindById(request: Request){
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return Response.json({
        success: false,
        message: "ID tidak boleh kosong",
      }, {status: 400})
    }

    try {
      if (typeof id !== 'string') {
        return Response.json({
          success: false,
          message: "ID tidak valid",
        }, {status: 400})
      }

      let data;

      // Special handling for 'edit' - get the first/only record
      if (id === 'edit') {
        data = await prisma.maskotDesa.findFirst({
          where: { isActive: true },
          include: {
            images: {
              include: {
                image: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' } // Get the oldest one first
        });
      } else {
        data = await prisma.maskotDesa.findUnique({
          where: { id },
          include: {
            images: {
              include: {
                image: true,
              }
            }
          }
        })
      }

      if(!data) {
        return Response.json({
          success: false,
          message: "Data tidak ditemukan",
        }, {status: 404})
      }

      return Response.json({
        success: true,
        message: "Berhasil mengambil data berdasarkan ID",
        data,
      }, {status: 200})
    } catch (error) {
      console.error("Find by ID error:", error);
      return Response.json({
        success: false,
        message: "Gagal mengambil data: " + (error instanceof Error ? error.message : 'Unknown error'),
      }, {status: 500})
    }
}