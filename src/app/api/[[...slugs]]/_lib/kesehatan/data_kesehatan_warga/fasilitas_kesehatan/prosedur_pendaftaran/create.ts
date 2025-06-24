import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.ProsedurPendaftaranGetPayload<{
    select: {
        content: true
    }
}>

async function prosedurPendaftaranCreate(context: Context) {
    const body = context.body as FormCreate

    const created = await prisma.prosedurPendaftaran.create({
        data: {
            content: body.content
        },
        select: {
            id: true,
            content: true,
        }
    })
    return{
        success: true,
        message: "Success create prosedur pendaftaran",
        data: created
    }
}

export default prosedurPendaftaranCreate
