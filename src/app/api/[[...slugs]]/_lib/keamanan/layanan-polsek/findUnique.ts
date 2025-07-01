import prisma from "@/lib/prisma";

export default async function layananPolsekFindUnique(request: Request){
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if(!id){
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

        const data = await prisma.layananPolsek.findUnique({
            where: { id },
        });

        if (!data) {
            return Response.json({
                success: false,
                message: "Layanan polsek tidak ditemukan",
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: "Success fetch layanan polsek by ID",
            data,
        }, { status: 200 });
    } catch (e) {
        console.error("Find by ID error:", e);
        return Response.json({
            success: false,
            message: "Gagal mengambil layanan polsek: " + (e instanceof Error ? e.message : 'Unknown error'),
        }, {
            status: 500,
        });
    }
}