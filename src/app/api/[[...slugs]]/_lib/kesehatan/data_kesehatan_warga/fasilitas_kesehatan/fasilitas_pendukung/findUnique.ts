import prisma from "@/lib/prisma";

export default async function fasilitasPendukungFindUnique(request: Request) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
        return Response.json({
            success: false,
            message: "ID is required",
        }, { status: 400 })
    }

    try {
        if (typeof id !== 'string') {
            return Response.json({
                success: false,
                message: "ID must be a string",
            }, { status: 400 })
        }

        const data = await prisma.fasilitasPendukung.findUnique({
            where: { id },
        })

        if (!data) {
            return Response.json({
                success: false,
                message: "Data tidak ditemukan",
            }, { status: 404 })
        }

        return Response.json({
            success: true,
            message: "Berhasil mengambil data berdasarkan ID",
            data,
        }, { status: 200 })
    } catch (error) {
        console.error("Error fetching data:", error);
        return Response.json({
            success: false,
            message: "Terjadi kesalahan saat mengambil data",
        }, { status: 500 })
    }
}