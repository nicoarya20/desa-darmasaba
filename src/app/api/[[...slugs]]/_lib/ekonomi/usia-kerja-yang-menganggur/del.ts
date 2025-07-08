import { Context } from "elysia";
import prisma from "@/lib/prisma";

export default async function grafikMenganggurBerdasarkanUsiaDelete(context: Context) {
    const {id} = context.params as {id: string}

    try {
        const existingData = await prisma.grafikMenganggurBerdasarkanUsia.findUnique({
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

        await prisma.grafikMenganggurBerdasarkanUsia.delete({
            where: {
                id: id
            }
        })

        return {
            success: true,
            message: "Data berhasil dihapus",
            data: {
                id: id,
            },
        }
    } catch (error) {
        console.error("Delete error:", error);
        return {
            success: false,
            message: "Gagal menghapus data: " + (error instanceof Error ? error.message : 'Unknown error'),
            data: null,
        }
    }
}