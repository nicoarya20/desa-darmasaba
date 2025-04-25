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

    await prisma.tarifDanLayanan.create({
        data: {
            layanan: body.layanan,
            tarif: body.tarif,
        }
    })
    return {
        success: true,
        message: "Success create tarif dan layanan",
        data: {
            ...body
        }
    }
}

export default tarifdanlayananCreate
