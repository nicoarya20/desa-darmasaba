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

   const created = await prisma.layananUnggulan.create({
        data: {
            content: body.content
        },
        select: {
            id: true,
            content: true,
        }
    })
    return {
        success: true,
        message: "Success create layanan unggulan",
        data: created
    }
}

export default layananUnggulanCreate
