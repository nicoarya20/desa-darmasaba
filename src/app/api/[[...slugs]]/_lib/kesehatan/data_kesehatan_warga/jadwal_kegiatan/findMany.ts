import prisma from "@/lib/prisma";

export default async function jadwalKegiatanFindMany() {
    try {
        const data = await prisma.jadwalKegiatan.findMany({
            where: {
                isActive: true,
            },
            include: {
                informasijadwalkegiatan: true,
                deskripsijadwalkegiatan: true,
                layananjadwalkegiatan: true,
                syaratketentuanjadwalkegiatan: true,
                dokumenjadwalkegiatan: true,
                pendaftaranjadwalkegiatan: true,
            }
        })
        return {
            success: true,
            message: "Success fetch jadwal kegiatan",
            data,
        }
    } catch (error) {
        console.error("Find many error:", error);
        return {
            success: false,
            message: "Failed fetch jadwal kegiatan",
        }
    }
}