import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function pendaftaranJadwalKegiatanFindUnique(context: Context) {
    const id = context.params?.id as string;

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

        const data = await prisma.pendaftaranJadwalKegiatan.findUnique({
            where: { id },
        });

        if (!data) {
            return Response.json({
                success: false,
                message: "Pendaftaran jadwal kegiatan tidak ditemukan",
            }, {status: 404});
        }

        return Response.json({
            success: true,
            message: "Success fetch pendaftaran jadwal kegiatan by ID",
            data,
        }, {status: 200});
    } catch (error) {
        console.error("Find by ID error:", error);
        return Response.json({
            success: false,
            message: "Gagal mengambil pendaftaran jadwal kegiatan: " + (error instanceof Error ? error.message : 'Unknown error'),
        }, {status: 500});
    }
}