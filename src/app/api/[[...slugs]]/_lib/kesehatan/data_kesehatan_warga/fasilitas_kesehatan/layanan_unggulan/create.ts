import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.LayananUnggulanGetPayload<{
    select: {
        content: true
    }
}>

async function layananUnggulanCreate(context: Context) {
    const body = context.body as FormCreate

    await prisma.layananUnggulan.create({
        data: {
            content: body.content
        }
    })
    return {
        success: true,
        message: "Success create layanan unggulan",
        data: {
            ...body
        }
    }
}

export default layananUnggulanCreate
