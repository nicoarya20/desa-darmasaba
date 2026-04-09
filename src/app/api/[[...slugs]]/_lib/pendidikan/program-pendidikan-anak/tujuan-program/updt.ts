import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.TujuanProgramGetPayload<{
    select: {
        id: true;
        judul: true;
        deskripsi: true;
    }
}>
export default async function tujuanProgramUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.tujuanProgram.update({
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