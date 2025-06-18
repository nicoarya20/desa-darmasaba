import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.PenghargaanGetPayload<{
    select: {
        juara: true;
        name: true;
        deskripsi: true;
        imageId: true;
    }
}>
export default async function penghargaanCreate(context: Context){
    const body = context.body as FormCreate;

    await prisma.penghargaan.create({
        data: {
            juara: body.juara,
            name: body.name,
            deskripsi: body.deskripsi,
            imageId: body.imageId,
        }
    })

    return {
        success: true,
        message: "Success create penghargaan",
        data: {
            ...body,
        }
    }
}