import prisma from "@/lib/prisma";

export default async function jadwalKegiatanFindUnique(request: Request) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
        return Response.json({
            success: false,
            message: "ID tidak boleh kosong",
        }, { status: 400 })
    }

    try {
        if (typeof id !== 'string') {
            return Response.json({
                success: false,
                message: "ID tidak valid",
            }, { status: 400 })
        }

        const data = await prisma.jadwalKegiatan.findUnique({
            where: {id},
            include: {
                informasijadwalkegiatan: true,
                deskripsijadwalkegiatan: true,
                layananjadwalkegiatan: true,
                syaratketentuanjadwalkegiatan: true,
                dokumenjadwalkegiatan: true,
                pendaftaranjadwalkegiatan: true,
            }
        })

        if (!data) {
            return Response.json({
                success: false,
                message: "Data tidak ditemukan",
            }, { status: 404 })
        }

        return Response.json({
            success: true,
            data,
        }, { status: 200 })
    } catch (error) {
        console.error("Gagal mengambil data jadwal kegiatan:", error);
        return Response.json({
            success: false,
            message: "Gagal mengambil data jadwal kegiatan",
        }, { status: 500 })
    }
}