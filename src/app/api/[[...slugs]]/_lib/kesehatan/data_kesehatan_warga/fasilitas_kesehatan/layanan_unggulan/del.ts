import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function layananUnggulanDelete(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "Id tidak ditemukan",
        }
    }

    const existing = await prisma.layananUnggulan.findUnique({
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

    const deleted = await prisma.layananUnggulan.delete({
        where: { id },
    })

    return {
        success: true,
        message: "Data berhasil dihapus",
        data: deleted,
    }
}