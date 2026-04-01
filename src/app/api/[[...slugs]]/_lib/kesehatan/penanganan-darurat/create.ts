import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.PenangananDaruratGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        imageId: true;
    };
}>;
export default async function penangananDaruratCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.penangananDarurat.create({
        data: {
            name: body.name,
            deskripsi: body.deskripsi,
            imageId: body.imageId,
        }
    })
    return {
        success: true,
        message: "Sukses menambahkan penanganan darurat",
        data: {
            ...body,
        },
    };
}