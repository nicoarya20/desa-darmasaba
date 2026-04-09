import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.FilosofiTriHitaGetPayload<{
    select: {
        id: true;
        judul: true;
        deskripsi: true;
    }
}>
export default async function filosofiTriHitaKaranaUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.filosofiTriHita.update({
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
        message: "Filosofi tri hita karana berhasil diupdate",
    }
}