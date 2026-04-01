import prisma from "@/lib/prisma";
import { Context } from "elysia";


export default async function jenisLayananCreate(context: Context) {
    const body = context.body as {nama: string, deskripsi: string};

    if (!body.nama) {
        return {
            success: false,
            message: "Nama is required",
        };
    }

    const jenisLayanan = await prisma.jenisLayanan.create({
        data: {
            nama: body.nama,
            deskripsi: body.deskripsi,
        },
    });
    return {
        success: true,
        message: "Sukses menambahkan jenis layanan",
        data: jenisLayanan
    };
}
