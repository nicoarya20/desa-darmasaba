import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function dokterDantenagamedisDelete(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "Id tidak ditemukan",
        }
    }

    const existing = await prisma.dokterdanTenagaMedis.findUnique({
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

    const deleted = await prisma.dokterdanTenagaMedis.delete({
        where: { id },
    })

    return {
        success: true,
        message: "Data berhasil dihapus",
        data: deleted,
    }
}