import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.ContohEdukasiLingkunganGetPayload<{
    select: {
        id: true;
        judul: true;
        deskripsi: true;
    }
}>
export default async function contohKegiatanDesaUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.contohEdukasiLingkungan.update({
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
        message: "Contoh kegiatan desa berhasil diupdate",
    }
}