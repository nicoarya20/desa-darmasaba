import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.TujuanBimbinganBelajarDesaGetPayload<{
    select: {
        id: true;
        judul: true;
        deskripsi: true;
    }
}>
export default async function tujuanProgramUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.tujuanBimbinganBelajarDesa.update({
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
        message: "Tujuan program berhasil diupdate",
    }
}