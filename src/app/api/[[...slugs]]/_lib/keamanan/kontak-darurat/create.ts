import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.KontakDaruratKeamananGetPayload<{
    select: {
        nama: true,
        kontak: true,
        icon: true,
    }
}>
export default async function kontakDaruratKeamananCreate(context: Context){
    const body = context.body as FormCreate

    await prisma.kontakDaruratKeamanan.create({
        data: {
            nama: body.nama,
            kontak: body.kontak,
            icon: body.icon,
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