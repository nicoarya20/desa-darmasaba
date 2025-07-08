import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.DataDemografiPekerjaanGetPayload<{
    select: {
        pekerjaan: true;
        lakiLaki: true;
        perempuan: true;
    }
}>

export default async function demografiPekerjaanCreate(context: Context) {
    const body = context.body as FormCreate;

    const created = await prisma.dataDemografiPekerjaan.create({
        data: {
            pekerjaan: body.pekerjaan,
            lakiLaki: body.lakiLaki,
            perempuan: body.perempuan,
        },
        select: {
            id: true,
            pekerjaan: true,
            lakiLaki: true,
            perempuan: true,
        }
    });
    return {
        success: true,
        message: "Success create demografi pekerjaan",
        data: created,
    };
}