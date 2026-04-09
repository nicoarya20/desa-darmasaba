import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.DesaDigitalGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        imageId: true;
    }
}>
export default async function desaDigitalCreate(context: Context){
    const body = context.body as FormCreate;

    await prisma.desaDigital.create({
        data: {
            name: body.name,
            deskripsi: body.deskripsi,
            imageId: body.imageId,
        }
    })

    return {
        success: true,
        message: "Sukses menambahkan desa digital",
        data: {
            ...body,
        }
    }
}