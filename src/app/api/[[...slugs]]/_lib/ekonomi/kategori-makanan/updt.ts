import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function kategoriMakananUpdate(context: Context) {
    const body = await context.request.json()

    if (!body.nama) {
        return {
            success: false,
            message: "Nama is required",
        }
    }

    const kategoriMakanan = await prisma.kategoriMakanan.update({
        where: {
            id: body.id,
        },
        data: {
            nama: body.nama,
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
        message: "Success update kategori makanan",
        data: kategoriMakanan,
    }
}
