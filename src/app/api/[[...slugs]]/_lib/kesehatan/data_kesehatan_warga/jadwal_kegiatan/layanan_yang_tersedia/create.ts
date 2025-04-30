import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.LayananJadwalKegiatanGetPayload<{
    select: {
        content: true
    }
}>

export default async function LayananTersediaCreate(context: Context) {
    const body = context.body as FormCreate

    await prisma.layananJadwalKegiatan.create({
        data: {
            content: body.content
        }
    })
    return {
        success: true,
        message: "Success create layanan yang tersedia",
        data: {
            ...body
        }
    }
}