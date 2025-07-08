import prisma from "@/lib/prisma";

export default async function grafikMenganggurBerdasarkanUsiaFindUnique(
    request: Request,
) {
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

        const data = await prisma.grafikMenganggurBerdasarkanUsia.findUnique({
            where: { id },
        });

        if (!data) {
            return Response.json({
                success: false,
                message: "Data tidak ditemukan",
                data: null,
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: "Data berhasil ditemukan",
            data,
        }, { status: 200 });
    } catch (error) {
        console.error("Find unique error:", error);
        return Response.json({
            success: false,
            message: "Gagal menemukan data: " + (error instanceof Error ? error.message : 'Unknown error'),
            data: null,
        }, { status: 500 });
    }
}