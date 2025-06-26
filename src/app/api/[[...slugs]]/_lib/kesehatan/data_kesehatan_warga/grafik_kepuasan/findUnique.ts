import prisma from "@/lib/prisma";

export default async function grafikKepuasanFindUnique(request: Request) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const uuid = pathSegments[pathSegments.length - 1];

    if (!uuid) {
        return Response.json({
            success: false,
            message: 'ID tidak boleh kosong',
        }, {status: 400})
    }

    try {
        if (typeof uuid !== 'string') {
            return Response.json({
                success: false,
                message: "ID tidak valid",
            }, { status: 400 });
        }

        const data = await prisma.grafikKepuasan.findUnique({
            where: { uuid },
        });

        if (!data) {
            return Response.json({
                success: false,
                message: "Data tidak ditemukan",
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: "Berhasil mengambil data berdasarkan ID",
            data,
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching data:", error);
        return Response.json({
            success: false,
            message: "Terjadi kesalahan saat mengambil data",
        }, { status: 500 });
    }
}