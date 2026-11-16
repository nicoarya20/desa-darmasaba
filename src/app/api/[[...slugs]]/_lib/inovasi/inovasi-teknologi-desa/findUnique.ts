import prisma from "@/lib/prisma";

/** Detail satu entri Inovasi Teknologi Desa (termasuk `kategori` dan gambar). */
export default async function inovasiTeknologiFindUnique(request: Request) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
        return Response.json({
            success: false,
            message: "ID tidak ditemukan",
        }, {status: 400});
    }

    try {
        if (typeof id !== 'string') {
            return Response.json({
                success: false,
                message: "ID tidak valid",
            }, {status: 400});
        }

        const data = await prisma.inovasiTeknologiDesa.findUnique({
            where: { id },
            include: {
                image: true,
            },
        });

        if (!data) {
            return Response.json({
                success: false,
                message: "Inovasi teknologi desa tidak ditemukan",
            }, {status: 404});
        }

        return Response.json({
            success: true,
            message: "Success fetch inovasi teknologi desa by ID",
            data,
        }, {status: 200});
    } catch (error) {
        console.error("Find by ID error:", error);
        return Response.json({
            success: false,
            message: "Gagal mengambil inovasi teknologi desa: " + (error instanceof Error ? error.message : 'Unknown error'),
        }, {status: 500});
    }
}