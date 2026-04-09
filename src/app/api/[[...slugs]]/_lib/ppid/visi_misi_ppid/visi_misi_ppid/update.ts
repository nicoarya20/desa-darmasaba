import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.VisiMisiPPIDGetPayload<{
    select: {
        id: true;
        misi: true;
        visi: true;
    }
}>
export default async function visimisiPPIDUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.visiMisiPPID.update({
        where: {
            id: body.id
        },
        data: {
            misi: body.misi,
            visi: body.visi,
        }
    })

    return {
        success: true,
        message: "Visi PPID Berhasil Diupdate",
        data: {
            ...body,
        }
    }
}