import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormUpdate = Prisma.JenisProgramYangDiselenggarakanGetPayload<{
    select: {
        id: true;
        judul: true;
        deskripsi: true;
    }
}>
export default async function jenisProgramYangDiselenggarakanUpdate(context: Context) {
    const body = context.body as FormUpdate;

    await prisma.jenisProgramYangDiselenggarakan.update({
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
        message: "Jenis program yang diselenggarakan berhasil diupdate",
    }
}