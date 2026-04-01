import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.InfoTeknoGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        imageId: true;
    }
}>
export default async function infoTeknoCreate(context: Context){
    const body = context.body as FormCreate;

    await prisma.infoTekno.create({
        data: {
            name: body.name,
            deskripsi: body.deskripsi,
            imageId: body.imageId,
        }
    })

    return {
        success: true,
        message: "Sukses menambahkan info teknologi",
        data: {
            ...body,
        }
    }
}