import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function posisiOrganisasiFindUnique(context: Context) {
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

        const data = await prisma.posisiOrganisasiBumDes.findUnique({
            where: { id },
        });

        if (!data) {
            return {
                success: false,
                message: "Posisi organisasi tidak ditemukan",
            }
        }

        return {
            success: true,
            message: "Success find posisi organisasi",
            data,
        }
    } catch (error) {
        console.error("Find by ID error:", error);
        return {
            success: false,
            message: "Gagal mengambil posisi organisasi: " + (error instanceof Error ? error.message : 'Unknown error'),
        }
    }
}