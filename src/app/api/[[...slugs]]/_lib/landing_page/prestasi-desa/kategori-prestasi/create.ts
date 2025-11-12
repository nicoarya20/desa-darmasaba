import prisma from "@/lib/prisma";
import { Context } from "elysia";


export default async function kategoriPrestasiCreate(context: Context) {
    const body = context.body as {name: string};

    if (!body.name) {
        return {
            success: false,
            message: "Nama is required",
        };
    }

    const kategoriPrestasi = await prisma.kategoriPrestasiDesa.create({
        data: {
            name: body.name,
        },
    });
    return {
        success: true,
        message: "Sukses menambahkan kategori prestasi",
        data: kategoriPrestasi
    };
}
