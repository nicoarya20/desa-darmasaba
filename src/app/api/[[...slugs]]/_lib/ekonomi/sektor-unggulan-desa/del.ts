import prisma from "@/lib/prisma"
import type { Context } from "elysia"

export default async function sektorUnggulanDesaDelete(context: Context) {
    const {id} = context.params as {id: string}

    try {
        const existingData = await prisma.sektorUnggulanDesa.findUnique({
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

        await prisma.sektorUnggulanDesa.delete({
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
            }
        }
    } catch (error) {
        console.error("Error deleting data:", error);
        return {
            success: false,
            message: "Gagal menghapus data",
            data: null,
        };
    }
}