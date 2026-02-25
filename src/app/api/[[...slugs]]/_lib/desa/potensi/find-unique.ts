import prisma from "@/lib/prisma";

export default async function findUnique(
    request: Request) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if(!id) {
        return Response.json({
            success: false,
            message: "ID tidak boleh kosong",
        }, { status: 400 });
    }

    try {
        if( typeof id !== 'string') {
            return Response.json({
                success: false,
                message: "ID harus berupa string",
            }, { status: 400 });
        }

        // ✅ Filter by isActive and deletedAt
        const data = await prisma.potensiDesa.findFirst({
            where: { 
                id,
                isActive: true,
                deletedAt: null,
            },
            include: {
                image: true,
                kategori: true
            },
        });

        if(!data) {
            return Response.json({
                success: false,
                message: "Potensi Desa tidak ditemukan",
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: "Success fetch potensi desa by ID",
            data,
        }, { status: 200 });
    } catch (error) {
        console.error("Find by ID error:", error);
        return Response.json({
            success: false,
            message: "Gagal mengambil potensi desa: " + (error instanceof Error ? error.message : 'Unknown error'),
        }, { status: 500 });
    }

}