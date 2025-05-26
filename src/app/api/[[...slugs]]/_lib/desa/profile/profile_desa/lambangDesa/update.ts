import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.ProfileDesaGetPayload<{
    select: {
        id: true;
        lambang: true;
    }
}>

export default async function lambangDesaUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.profileDesa.update({
        where: {
            id: body.id
        },
        data: {
            lambang: body.lambang,
        }
    })

    return {
        success: true,
        message: "Profile Desa Berhasil Diupdate",
    }
}