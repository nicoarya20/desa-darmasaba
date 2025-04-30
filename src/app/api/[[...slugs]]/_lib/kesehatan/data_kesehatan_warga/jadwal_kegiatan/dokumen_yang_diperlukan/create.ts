import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.DokumenJadwalKegiatanGetPayload<{
    select: {
        content: true
    }
}>

export default async function DokumenDiperlukanCreate(context: Context){
    const body = context.body as FormCreate
    
    await prisma.dokumenJadwalKegiatan.create({
        data: {
            content: body.content
        }
    })
    return {
        success: true,
        message: "Success create dokumen yang diperlukan",
        data: {
            ...body
        }
    }
}