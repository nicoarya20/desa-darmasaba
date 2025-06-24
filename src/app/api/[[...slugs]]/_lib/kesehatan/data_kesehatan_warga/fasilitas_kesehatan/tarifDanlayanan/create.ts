import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.TarifDanLayananGetPayload<{
    select: {
        layanan: true
        tarif: true
    }
}>

async function tarifdanlayananCreate(context: Context) {
    const body = context.body as FormCreate

   const created =  await prisma.tarifDanLayanan.create({
        data: {
            layanan: body.layanan,
            tarif: body.tarif,
        },
        select: {
            id: true,
            layanan: true,
            tarif: true
        }
    })
    return {
        success: true,
        message: "Success create tarif dan layanan",
        data: created
    }
}

export default tarifdanlayananCreate
