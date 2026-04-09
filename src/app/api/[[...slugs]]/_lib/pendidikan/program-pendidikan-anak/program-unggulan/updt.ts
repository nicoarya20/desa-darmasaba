import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.ProgramUnggulanGetPayload<{
    select: {
        id: true;
        judul: true;
        deskripsi: true;
    }
}>
export default async function programUnggulanUpdate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.programUnggulan.update({
        where: {
            id: body.id
        },
        data: {
            judul: body.judul,
            deskripsi: body.deskripsi,
        }
    })

    return {
        success: true,
        message: "Program unggulan berhasil diupdate",
    }
}