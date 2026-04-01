import prisma from "@/lib/prisma";

export default async function findMusikById(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "ID tidak valid",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await prisma.musikDesa.findUnique({
      where: { id },
      include: {
        audioFile: true,
        coverImage: true,
      },
    });

    if (!data) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Musik tidak ditemukan",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Success fetch musik by ID",
        data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Error fetching musik by ID:", e);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Gagal mengambil musik: " + (e instanceof Error ? e.message : 'Unknown error'),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
