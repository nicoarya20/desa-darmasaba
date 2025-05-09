import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormUpdate = Prisma.MisiPPIDGetPayload<{
    select: {
        content: true;
    }
}>

export default async function misiPPIDUpdate(context: Context) {
    const id = context.params.id
    const body = context.body as FormUpdate;

    await prisma.misiPPID.update({
        where: { id: id },
        data: {
            content: body.content,
        }
    })

    return {
        success: true,
        message: "Misi PPID Berhasil Diupdate",
        data: {
            ...body,
        }
    }
}