import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.DasarHukumPPIDGetPayload<{
    select: {
        id: true;
        judul: true;
        content: true;
    }
}>
export default async function dasarHukumPPIDUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.dasarHukumPPID.update({
        where: {
            id: body.id
        },
        data: {
            judul: body.judul,
            content: body.content,
        }
    })

    return {
        success: true,
        message: "Dasar Hukum PPID Berhasil Dibuat",
    }
}