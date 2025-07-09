import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function sedangMencariKerjaDelete(context: Context) {
    const id = context.params?.id;

    if (!id) {
        return {
            success: false,
            message: "ID tidak ditemukan",
        }
    }

    const existing = await prisma.sedangMencariKerja.findUnique({
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

    const deleted = await prisma.sedangMencariKerja.delete({
        where: {
            id: id,
        },
    })

    return {
        success: true,
        message: "Berhasil menghapus data sedang mencari kerja",
        data: deleted,
    }
}