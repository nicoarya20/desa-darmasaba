import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function grafikKepuasanDelete(context: Context) {
    const uuid = context.params?.uuid;
    if (!uuid) {
        return {
            success: false,
            message: "ID tidak ditemukan"
        }
    }

    const existing = await prisma.grafikKepuasan.findUnique({
        where: {
            uuid: uuid,
        },
    })

    if (!existing) {
        return {
            success: false,
            message: "Data tidak ditemukan",
        }
    }

    const deleted = await prisma.grafikKepuasan.delete({
        where: { uuid },
    })

    return {
        success: true,
        message: "Data berhasil dihapus",
        data: deleted,
    }
}