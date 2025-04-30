import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.InformasiJadwalKegiatanGetPayload<{
    select: {
        name: true
        tanggal: true
        waktu: true
        lokasi: true
    }
}>

async function informasiJadwalKegiatanCreate(context: Context) {
    const body = context.body as FormCreate

    await prisma.informasiJadwalKegiatan.create({
        data: {
            name: body.name,
            tanggal: body.tanggal,
            waktu: body.waktu,
            lokasi: body.lokasi,
        }
    })
    return{
        success: true,
        message: "Success create informasi jadwal kegiatan",
        data: {
            ...body
        }
    }
}
export default informasiJadwalKegiatanCreate