import prisma from "@/lib/prisma";
import { Context } from "elysia";


export default async function kategoriMakananCreate(context: Context) {
    const body = context.body as {nama: string};

    if (!body.nama) {
        return {
            success: false,
            message: "Nama is required",
        };
    }

    const kategoriMakanan = await prisma.kategoriMakanan.create({
        data: {
            nama: body.nama,
            deletedAt: null,
        },
    });
    return {
        success: true,
        message: "Success create kategori makanan",
        data: kategoriMakanan
    };
}
