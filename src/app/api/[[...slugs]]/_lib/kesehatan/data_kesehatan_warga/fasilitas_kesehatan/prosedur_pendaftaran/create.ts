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

    await prisma.prosedurPendaftaran.create({
        data: {
            content: body.content
        }
    })
    return{
        success: true,
        message: "Success create prosedur pendaftaran",
        data: {
            ...body
        }
    }
}

export default prosedurPendaftaranCreate
