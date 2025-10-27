import prisma from "@/lib/prisma";

export default async function apbDesaFindUnique(
    request: Request
  ) {
    // Extract the ID from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    if (!id) {
      return Response.json({
        success: false,
        message: "ID tidak boleh kosong",
      }, { status: 400 });
    }
  
    try {
      // Validate that the ID is a valid UUID or whatever format you're using
      if (typeof id !== 'string') {
        return Response.json({
          success: false,
          message: "ID tidak valid",
        }, { status: 400 });
      }
  
      const data = await prisma.apbDesa.findUnique({
        where: { id },
        include: {
          pendapatan: true,
          belanja: true,
          pembiayaan: true,
        }
      });
  
      if (!data) {
        return Response.json({
          success: false,
          message: "Apb desa tidak ditemukan",
        }, { status: 404 });
      }
  
      // Ensure we're returning a proper Response object
      return Response.json({
        success: true,
        message: "Success fetch apb desa by ID",
        data,
      }, {
        status: 200,
      });
    } catch (e) {
      console.error("Find by ID error:", e);
      return Response.json({
        success: false,
        message: "Gagal mengambil apb desa: " + (e instanceof Error ? e.message : 'Unknown error'),
      }, {
        status: 500,
      });
    }
  }
    