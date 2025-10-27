import prisma from "@/lib/prisma";

export default async function belanjaFindUnique(request: Request) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");
  const id = pathSegments[pathSegments.length - 1];

  if (!id) {
    return Response.json(
      {
        success: false,
        message: "ID tidak boleh kosong",
      },
      { status: 400 }
    );
  }

  try {
    // Validate that the ID is a valid UUID or whatever format you're using
    if (typeof id !== "string") {
      return Response.json(
        {
          success: false,
          message: "ID tidak valid",
        },
        { status: 400 }
      );
    }

    const data = await prisma.belanja.findUnique({
      where: { id },
    });

    if (!data) {
      return Response.json(
        {
          success: false,
          message: "Belanja tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Ensure we're returning a proper Response object
    return Response.json(
      {
        success: true,
        message: "Success fetch belanja by ID",
        data,
      },
      {
        status: 200,
      }
    );
  } catch (e) {
    console.error("Find by ID error:", e);
    return Response.json(
      {
        success: false,
        message:
          "Gagal mengambil belanja: " +
          (e instanceof Error ? e.message : "Unknown error"),
      },
      {
        status: 500,
      }
    );
  }
}
