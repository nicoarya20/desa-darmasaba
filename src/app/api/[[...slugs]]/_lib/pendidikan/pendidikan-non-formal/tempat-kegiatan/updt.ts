import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormUpdate = Prisma.TempatKegiatanGetPayload<{
    select: {
        id: true;
        judul: true;
        deskripsi: true;
    }
}>
export default async function tempatKegiatanUpdate(context: Context) {
    const body = context.body as FormUpdate;

    await prisma.tempatKegiatan.update({
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
        message: "Tempat kegiatan berhasil diupdate",
    }
}