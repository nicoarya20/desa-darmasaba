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

    await prisma.fasilitasPendukung.create({
        data: {
  
            content: body.content
        }
    })
    return {
        success: true,
        message: "Success create fasilitas pendukung",
        data: {
            ...body
        }
    }
}

export default FasilitasPendukungCreate