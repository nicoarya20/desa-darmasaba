import prisma from "@/lib/prisma"
import { Context } from "elysia"

export default async function dataPendidikanDelete(context: Context) {
    const {id} = context.params as {id: string}

    try {
        const existingData = await prisma.dataPendidikan.findUnique({
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

        await prisma.dataPendidikan.delete({
            where: {
                id: id
            }
        })

        return {
            success: true,
            message: "Data berhasil dihapus",
            data: {
                id: id,
                deleted: true,
            },
        }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
            data: null,
        }
    }
}