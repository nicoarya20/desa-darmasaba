import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.InformasiUmumGetPayload<{
    select: {
        fasilitas: true
        alamat: true
        jamOperasional: true
    }
}>
async function informasiUmumCreate(context: Context) {
    const body = context.body as FormCreate

    const created = await prisma.informasiUmum.create({
        data: {
            fasilitas: body.fasilitas,
            alamat: body.alamat,
            jamOperasional: body.jamOperasional,
        },
        select: {
            id: true,
            fasilitas: true,
            alamat: true,
            jamOperasional: true,
        }
    })
    return{
        success: true,
        message: "Success create informasi umum",
        data: created
    }
}

export default informasiUmumCreate
