import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.KontakDaruratGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        imageId: true;
        whatsapp: true;
    };
}>;
export default async function kontakDaruratCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.kontakDarurat.create({
        data: {
            name: body.name,
            deskripsi: body.deskripsi,
            imageId: body.imageId,
            whatsapp: body.whatsapp,
        }
    })
    return {
        success: true,
        message: "Success create kontak darurat",
        data: {
            ...body,
        },
    };
}