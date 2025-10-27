import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.MateriEdukasiLingkunganGetPayload<{
    select: {
        id: true;
        judul: true;
        deskripsi: true;
    }
}>
export default async function materiEdukasiLingkunganUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.materiEdukasiLingkungan.update({
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
        message: "Materi edukasi lingkungan berhasil diupdate",
    }
}