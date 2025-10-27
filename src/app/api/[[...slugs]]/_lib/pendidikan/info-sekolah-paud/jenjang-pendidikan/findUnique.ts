import { Context } from "elysia";
import prisma from "@/lib/prisma";

export default async function jenjangPendidikanFindUnique(context: Context) {
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

        const data = await prisma.jenjangPendidikan.findUnique({
            where: { id },
        });

        if (!data) {
            return {
                success: false,
                message: "Jenjang Pendidikan tidak ditemukan",
            }
        }

        return {
            success: true,
            message: "Success find jenjang pendidikan",
            data,
        }
    } catch (error) {
        console.error("Find by ID error:", error);
        return {
            success: false,
            message: "Gagal mengambil jenjang pendidikan: " + (error instanceof Error ? error.message : 'Unknown error'),
        }
    }
}