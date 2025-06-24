import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.FasilitasPendukungGetPayload<{
    select: {
        content: true
    }
}>

async function FasilitasPendukungCreate(context: Context){
    const body = context.body as FormCreate

  const created = await prisma.fasilitasPendukung.create({
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
        message: "Success create fasilitas pendukung",
        data: created
    }
}

export default FasilitasPendukungCreate