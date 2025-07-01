import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
        nama: string,
        imageId?: string,
        kontakItems: {
            nama: string,
            nomorTelepon: string,
            imageId?: string
        }[]
}
export default async function kontakDaruratKeamananCreate(context: Context){
    const body = context.body as FormCreate

    await prisma.kontakDaruratKeamanan.create({
        data: {
            nama: body.nama,
            imageId: body.imageId,
            kontakItems: {
                create: body.kontakItems,
            },
        },
        include: {
            kontakItems: true,
        }
    })
    return {
        success: true,
        message: "Success create kontak darurat keamanan",
        data: {
            ...body,
        },
    }
}