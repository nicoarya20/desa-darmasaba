import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function grafikKepuasanDelete(context: Context) {
    const id = context.params?.id;
    
    if (!id) {
        return {
            success: false,
            message: "ID tidak ditemukan"
        }
    }

    const existing = await prisma.grafikKepuasan.findUnique({
        where: {
            id: id,
        },
    })

    if (!existing) {
        return {
            success: false,
            message: "Data tidak ditemukan",
        }
    }

    const deleted = await prisma.grafikKepuasan.delete({
        where: { id },
    })

    return {
        success: true,
        message: "Data berhasil dihapus",
        data: deleted,
    }
}