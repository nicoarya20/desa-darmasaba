import prisma from "@/lib/prisma";
import { Context } from "elysia";

const kategoriMakananDelete = async (context: Context) => {
    const id = context.params.id;
    if (!id) {
        return {
            success: false,
            message: "ID is required",
        }
    }

    const kategoriMakanan = await prisma.kategoriMakanan.delete({
        where: {
            id: id,
        },
    })

    if(!kategoriMakanan) {
        return {
            success: false,
            message: "Kategori makanan tidak ditemukan",
        }
    }

    return {
        success: true,
        message: "Success delete kategori makanan",
        data: kategoriMakanan,
    }
}

export default kategoriMakananDelete
