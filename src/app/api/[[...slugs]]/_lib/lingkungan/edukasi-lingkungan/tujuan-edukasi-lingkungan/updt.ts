import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.TujuanEdukasiLingkunganGetPayload<{
    select: {
        id: true;
        judul: true;
        deskripsi: true;
    }
}>
export default async function tujuanEdukasiLingkunganUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.tujuanEdukasiLingkungan.update({
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
        message: "Tujuan edukasi lingkungan berhasil diupdate",
    }
}