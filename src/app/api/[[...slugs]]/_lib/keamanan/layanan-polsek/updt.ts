import prisma from "@/lib/prisma";
import { Context } from "elysia";


export default async function layananPolsekUpdate(context: Context) {
    const body = await context.request.json()

    if (!body.nama) {
        return {
            success: false,
            message: "Nama is required",
        }
    }

    const layanan = await prisma.layananPolsek.update({
        where: {
            id: body.id,
        },
        data: { 
            nama: body.nama,
        },
    })

    return {
        success: true,
        message: "Success update layanan polsek",
        data: layanan,
    }
}