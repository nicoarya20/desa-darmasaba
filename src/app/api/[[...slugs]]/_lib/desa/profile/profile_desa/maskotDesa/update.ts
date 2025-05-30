import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.ProfileDesaGetPayload<{
    select: {
        id: true;
        maskot: true;
    }
}>

export default async function maskotDesaUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.profileDesa.update({
        where: {
            id: body.id
        },
        data: {
            maskot: body.maskot,
        }
    })

    return {
        success: true,
        message: "Profile Desa Berhasil Diupdate",
    }
}
        