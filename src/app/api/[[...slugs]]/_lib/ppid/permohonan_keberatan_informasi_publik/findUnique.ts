import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function permohonanKeberatanInformasiPublikFindUnique(context: Context) {
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

        const data = await prisma.formulirPermohonanKeberatan.findUnique({
            where: { id },
        });

        if (!data) {
            return {
                success: false,
                message: "Permohonan keberatan informasi publik tidak ditemukan",
            }
        }

        return {
            success: true,
            message: "Success find permohonan keberatan informasi publik",
            data,
        }
    } catch (error) {
        console.error("Find by ID error:", error);
        return {
            success: false,
            message: "Gagal mengambil permohonan keberatan informasi publik: " + (error instanceof Error ? error.message : 'Unknown error'),
        }
    }
}