import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.LokasiJadwalBimbinganBelajarDesaGetPayload<{
    select: {
        id: true;
        judul: true;
        deskripsi: true;
    }
}>
export default async function lokasiDanJadwalUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.lokasiJadwalBimbinganBelajarDesa.update({
        where: {
            id: body.id
        },
        data: {
            judul: body.judul,
            deskripsi: body.deskripsi,
        }
    })

    return {
        success: true,
        message: "Lokasi dan jadwal berhasil diupdate",
    }
}