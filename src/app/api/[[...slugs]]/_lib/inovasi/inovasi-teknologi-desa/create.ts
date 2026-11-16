import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.DesaDigitalGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        imageId: true;
    }
}>
export default async function desaDigitalCreate(context: Context){
    const body = context.body as FormCreate;

    const result = await prisma.desaDigital.create({
        data: {
            name: body.name,
            deskripsi: body.deskripsi,
            imageId: body.imageId,
        }
    })

    return {
        success: true,
        message: "Sukses menambahkan desa digital",
        data: result,
    }
}