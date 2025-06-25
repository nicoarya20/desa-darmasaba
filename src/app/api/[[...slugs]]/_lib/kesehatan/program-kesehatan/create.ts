import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.ProgramKesehatanGetPayload<{
    select: {
        name: true;
        deskripsiSingkat: true;
        deskripsi: true;
        imageId: true;
    }
}>
export default async function programKesehatanCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.programKesehatan.create({
        data: {
            name: body.name,
            deskripsiSingkat: body.deskripsiSingkat,
            deskripsi: body.deskripsi,
            imageId: body.imageId,
        }
    })
    return {
        success: true,
        message: "Success create program kesehatan",
        data: {
            ...body,
        },
    };
}