import { Context } from "elysia";
import prisma from "@/lib/prisma";

export default async function kategoriKegiatanFindUnique(context: Context) {
    const url = new URL(context.request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    if (!id) {
        return {
            success: false,
            message: "ID is required",
        }
    }

    try {
        if (typeof id !== 'string') {
            return {
                success: false,
                message: "ID is required",
            }
        }

        const data = await prisma.kategoriKegiatan.findUnique({
            where: { id },
        });

        if (!data) {
            return {
                success: false,
                message: "Kategori kegiatan tidak ditemukan",
            }
        }

        return {
            success: true,
            message: "Success find kategori kegiatan",
            data,
        }
    } catch (error) {
        console.error("Find by ID error:", error);
        return {
            success: false,
            message: "Gagal mengambil kategori kegiatan: " + (error instanceof Error ? error.message : 'Unknown error'),
        }
    }
}