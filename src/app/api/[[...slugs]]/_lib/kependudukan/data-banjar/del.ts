import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function dataBanjarDelete(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "ID tidak ditemukan",
        }
    }

    const existing = await prisma.dataBanjar.findUnique({
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

    const deleted = await prisma.dataBanjar.delete({
        where: { id },
    })

    return {
        success: true,
        message: "Data berhasil dihapus",
        data: deleted,
    }
}
