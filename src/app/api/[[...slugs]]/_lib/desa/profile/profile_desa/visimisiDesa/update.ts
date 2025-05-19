import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.ProfileDesaGetPayload<{
    select: {
        id: true;
        visi: true;
        misi: true;
    }
}>
export default async function visimisiDesaUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.profileDesa.update({
        where: {
            id: body.id
        },
        data: {
            visi: body.visi,
            misi: body.misi,
        }
    })

    return {
        success: true,
        message: "Profile Desa Berhasil Diupdate",
    }
}
