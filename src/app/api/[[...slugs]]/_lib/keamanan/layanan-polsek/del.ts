import prisma from "@/lib/prisma";
import { Context } from "elysia";

export const layananPolsekDelete = async (context: Context) => {
    const id = context.params.id;
    if (!id) {
        return {
            success: false,
            message: "ID is required",
        }
    }

    const layanan = await prisma.layananPolsek.delete({
        where: {
            id: id,
        },
    })

    if(!layanan) {
        return {
            success: false,
            message: "Layanan polsek tidak ditemukan",
        }
    }

    return {
        success: true,
        message: "Sukses Menghapus layanan polsek",
        data: layanan,
    }
}