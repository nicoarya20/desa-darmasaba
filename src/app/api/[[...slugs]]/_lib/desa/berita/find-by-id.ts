import prisma from "@/lib/prisma";

export default async function handler(
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

    const data = await prisma.berita.findUnique({
      where: { id },
      include: {
        image: true,
        kategoriBerita: true,
      },
    });

    if (!data) {
      return Response.json({
        success: false,
        message: "Berita tidak ditemukan",
      }, { status: 404 });
    }

    // Ensure we're returning a proper Response object
    return new Response(JSON.stringify({
      success: true,
      message: "Success fetch berita by ID",
      data,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    console.error("Find by ID error:", e);
    return new Response(JSON.stringify({
      success: false,
      message: "Gagal mengambil berita: " + (e instanceof Error ? e.message : 'Unknown error'),
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}