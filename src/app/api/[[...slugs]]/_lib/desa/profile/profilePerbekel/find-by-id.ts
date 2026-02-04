import prisma from "@/lib/prisma";

export default async function profilePerbekelFindById(request: Request) {
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
        if (typeof id !== 'string') {
            return Response.json({
                success: false,
                message: "ID tidak valid",
            }, { status: 400 });
        }

        let data;

        // Special handling for 'edit' - get the first/only record
        if (id === 'edit') {
          data = await prisma.profilPerbekel.findFirst({
            where: { isActive: true },
            include: {
              image: true,
            },
            orderBy: { createdAt: 'asc' } // Get the oldest one first
          });
        } else {
          data = await prisma.profilPerbekel.findUnique({
            where: { id },
            include: {
              image: true,
            }
          });
        }

        if (!data) {
            return Response.json({
                success: false,
                message: "Data tidak ditemukan",
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: "Data berhasil ditemukan",
            data,
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching profile Perbekel:", error);
        return Response.json({
            success: false,
            message: "Terjadi kesalahan saat mengambil data profile Perbekel",
        }, { status: 500 });
    }
}