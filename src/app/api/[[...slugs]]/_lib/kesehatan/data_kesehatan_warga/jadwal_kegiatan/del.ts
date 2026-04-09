import prisma from "@/lib/prisma";
import type { Context } from "elysia";

const jadwalKegiatanDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            message: "ID tidak ditemukan",
        }
    }

    const jadwalKegiatan = await prisma.jadwalKegiatan.findUnique({
        where: { id },
        include: {
            informasijadwalkegiatan: true,
            deskripsijadwalkegiatan: true,
            layananjadwalkegiatan: true,
            syaratketentuanjadwalkegiatan: true,
            dokumenjadwalkegiatan: true,
        }
    })

    if (!jadwalKegiatan) {
        return {
            status: 404,
            message: "Jadwal kegiatan tidak ditemukan",
        }
    }

    await prisma.jadwalKegiatan.delete({
        where: { id },
    })

    return {
        status: 200,
        success: true,
        message: "Jadwal kegiatan berhasil dihapus",
    }
}
export default jadwalKegiatanDelete