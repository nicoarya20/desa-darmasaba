import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.DokterdanTenagaMedisGetPayload<{
    select: {
        name: true
        specialist: true
        jadwal: true
    }
}>

async function dokterDantenagamedisCreate(context: Context) {
    const body = context.body as FormCreate

    await prisma.dokterdanTenagaMedis.create({
        data: {
            name: body.name,
            specialist: body.specialist,
            jadwal: body.jadwal,
        }
    })
    return {
        success: true,
        message: "Success create dokter dan tenaga medis",
        data: {
            ...body
        }
    }
}
export default dokterDantenagamedisCreate