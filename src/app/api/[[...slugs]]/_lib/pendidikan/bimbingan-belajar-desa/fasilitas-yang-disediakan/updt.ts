import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.FasilitasBimbinganBelajarDesaGetPayload<{
    select: {
        id: true;
        judul: true;
        deskripsi: true;
    }
}>
export default async function fasilitasYangDisediakanUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.fasilitasBimbinganBelajarDesa.update({
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
        message: "Fasilitas yang disediakan berhasil diupdate",
    }
}