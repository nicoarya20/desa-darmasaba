import prisma from "@/lib/prisma";
import { Context } from "elysia";

const jenisLayananDelete = async (context: Context) => {
    const id = context.params.id;
    if (!id) {
        return {
            success: false,
            message: "ID is required",
        }
    }

    const jenisLayanan = await prisma.jenisLayanan.delete({
        where: {
            id: id,
        },
    })

    if(!jenisLayanan) {
        return {
            success: false,
            message: "Jenis layanan tidak ditemukan",
        }
    }

    return {
        success: true,
        message: "Success delete jenis layanan",
        data: jenisLayanan,
    }
}

export default jenisLayananDelete
