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

    const created = await prisma.dokterdanTenagaMedis.create({
        data: {
            name: body.name,
            specialist: body.specialist,
            jadwal: body.jadwal,
        },
        select: {
            id: true,
            name: true,
            specialist: true,
            jadwal: true,
        }
    })
    return {
        success: true,
        message: "Success create dokter dan tenaga medis",
        data: created
    }
}
export default dokterDantenagamedisCreate