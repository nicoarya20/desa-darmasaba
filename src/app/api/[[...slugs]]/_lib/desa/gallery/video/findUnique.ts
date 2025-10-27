import prisma from "@/lib/prisma";

export default async function galleryVideoFindUnique(request: Request) {
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
        if (typeof id !== 'string') {
            return Response.json({
                success: false,
                message: "ID tidak valid",
            }, { status: 400 });
        }

        const data = await prisma.galleryVideo.findUnique({
            where: { id },
        });

        if (!data) {
            return Response.json({
                success: false,
                message: "Gallery video tidak ditemukan",
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: "Success fetch gallery video by ID",
            data,
        }, { status: 200 });
    } catch (error) {
        console.error("Find by ID error:", error);
        return Response.json({
            success: false,
            message: "Gagal mengambil gallery video: " + (error instanceof Error ? error.message : 'Unknown error'),
        }, { status: 500 });
    }
}
