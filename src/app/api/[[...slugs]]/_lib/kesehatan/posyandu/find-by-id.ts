import prisma from "@/lib/prisma";
import { GALERI_SELECT, URUTAN_ANAK } from "../../_konten-bersama/daftar-anak.config";
import { MAX_FOTO_KEGIATAN_POSYANDU } from "@/lib/posyandu/posyandu-konten.validation";

/** GET (publik): detail posyandu beserta banjar dan galeri foto lokasi & kader. */
export default async function findPosyanduById(request: Request) {
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

        const data = await prisma.posyandu.findUnique({
            where: {id},
            include: {
                image: true,
                banjar: { select: { id: true, name: true } },
                // Galeri foto lokasi & kader hanya di detail; find-many tetap ringan.
                fotoKegiatan: { select: GALERI_SELECT, orderBy: [...URUTAN_ANAK], take: MAX_FOTO_KEGIATAN_POSYANDU },
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
            message: "Success fetch posyandu by ID",
            data,
        }, { status: 200 })
    } catch (error) {
        console.error("Find by ID error:", error);
        return Response.json({
            success: false,
            message: "Gagal mengambil posyandu: " + (error instanceof Error ? error.message : 'Unknown error'),
        }, { status: 500 })
    }
}