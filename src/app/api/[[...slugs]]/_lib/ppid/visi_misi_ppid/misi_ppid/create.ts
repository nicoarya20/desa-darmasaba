import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.MisiPPIDGetPayload<{
    select: {
        content: true;
    }
}>

export default async function misiPPIDCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.misiPPID.create({
        data: {
            content: body.content,
        }
    })

    return {
        success: true,
        message: "Misi PPID Berhasil Dibuat",
        data: {
            ...body,
        }
    }
}