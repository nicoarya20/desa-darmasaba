import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.InfoWabahPenyakitGetPayload<{
    select: {
        name: true;
        deskripsiSingkat: true;
        deskripsiLengkap: true;
        imageId: true;
    };
}>
export default async function infoWabahPenyakitCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.infoWabahPenyakit.create({
        data: {
            name: body.name,
            deskripsiSingkat: body.deskripsiSingkat,
            deskripsiLengkap: body.deskripsiLengkap,
            imageId: body.imageId,
        }
    })
    return {
        success: true,
        message: "Sukses menambahkan info wabah penyakit",
        data: {
            ...body,
        },
    };
}
    