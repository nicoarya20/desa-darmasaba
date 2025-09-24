import prisma from "@/lib/prisma";

export default async function findUniqueAjukanPermohonan(request: Request) {
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
    if (typeof id !== "string") {
      return Response.json(
        {
          success: false,
          message: "ID tidak valid",
        },
        { status: 400 }
      );
    }

    const data = await prisma.ajukanPermohonan.findUnique({
      where: { id },
      include: {
        kategori: true,
      },
    });

    if (!data) {
      return Response.json(
        {
          success: false,
          message: "Ajukan permohonan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Success fetch ajukan permohonan by ID",
        data,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Find by ID error:", e);
    return Response.json(
      {
        success: false,
        message:
          "Gagal mengambil ajukan permohonan: " +
          (e instanceof Error ? e.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
