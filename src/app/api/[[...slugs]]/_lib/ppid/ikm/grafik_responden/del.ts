import prisma from "@/lib/prisma"
import type { Context } from "elysia"

export default async function grafikRespondenDelete(context: Context) {
    const { id } = context.params as { id: string }

    try {
        const existingData = await prisma.grafikBerdasarkanResponden.findUnique({
            where: {
                id: id,
            }
        })

        if (!existingData) {
            return {
                success: false,
                message: "Data tidak ditemukan",
                data: null,
            }
        }

        await prisma.grafikBerdasarkanResponden.delete({
            where: {
                id: id
            }
        })

        return {
            success: true,
            message: "Data berhasil dihapus",
            data: null,
        }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
            data: null,
        }
    }
}