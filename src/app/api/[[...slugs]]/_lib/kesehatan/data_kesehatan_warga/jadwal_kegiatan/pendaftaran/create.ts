import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.PendaftaranJadwalKegiatanGetPayload<{
    select: {
        name: true
        tanggal: true
        namaOrangtua: true
        nomor: true
        alamat: true
        catatan: true
    }
}>

export default async function PendaftaranJadwalCreate(context: Context) {
    const body = context.body as FormCreate

    await prisma.pendaftaranJadwalKegiatan.create({
        data: {
            name: body.name,
            tanggal: body.tanggal,
            namaOrangtua: body.namaOrangtua,
            nomor: body.nomor,
            alamat: body.alamat,
            catatan: body.catatan
        }
    })
    return {
        success: true,
        message: "Success create pendaftaran jadwal kegiatan",
        data: {
            ...body
        }
    }
}