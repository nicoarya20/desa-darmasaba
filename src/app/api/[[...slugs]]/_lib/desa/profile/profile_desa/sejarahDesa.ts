import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.ProfileDesaGetPayload<{
    select: {
        id: true;
        sejarah: true;
    }
}>

export default async function sejarahDesaUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.profileDesa.update({
        where: {
            id: body.id
        },
        data: {
            sejarah: body.sejarah,
        }
    })

    return {
        success: true,
        message: "Profile Desa Berhasil Diupdate",
    }
}
    