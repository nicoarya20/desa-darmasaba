import prisma from "@/lib/prisma";
import type { Context } from "elysia";


export default async function kategoriProdukCreate(context: Context) {
    const body = context.body as {nama: string};

    if (!body.nama) {
        return {
            success: false,
            message: "Nama is required",
        };
    }

    const kategoriProduk = await prisma.kategoriProduk.create({
        data: {
            nama: body.nama,
        },
    });
    return {
        success: true,
        message: "Sukses menambahkan kategori produk",
        data: kategoriProduk
    };
}
