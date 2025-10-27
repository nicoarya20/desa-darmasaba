import prisma from "@/lib/prisma";

export default async function pengaduanMasyarakatFindUnique({ params }: { params: { id: string } }) {
    const { id } = params;

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

        const data = await prisma.pengaduanMasyarakat.findUnique({
            where: { id },
            include: {
                image: true,
                jenisPengaduan: true,
            },
        });

        if (!data) {
            return Response.json({
                success: false,
                message: "Pengaduan masyarakat tidak ditemukan",
            }, {status: 404});
        }

        return Response.json({
            success: true,
            message: "Success fetch pengaduan masyarakat by ID",
            data,
        }, {status: 200});
    } catch (error) {
        console.error("Find by ID error:", error);
        return Response.json({
            success: false,
            message: "Gagal mengambil pengaduan masyarakat: " + (error instanceof Error ? error.message : 'Unknown error'),
        }, {status: 500});
    }
}