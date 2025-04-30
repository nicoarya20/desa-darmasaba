import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.DeskripsiJadwalKegiatanGetPayload<{
    select: {
        deskripsi: true
    }
}>

async function deskripsiJadwalKegiatanCreate(context: Context) {
    const body = context.body as FormCreate

    await prisma.deskripsiJadwalKegiatan.create({
        data: {
            deskripsi: body.deskripsi,
        }
    })
    return{
        success: true,
        message: "Success create deskripsi jadwal kegiatan",
        data: {
            ...body
        }
    }
}

export default deskripsiJadwalKegiatanCreate