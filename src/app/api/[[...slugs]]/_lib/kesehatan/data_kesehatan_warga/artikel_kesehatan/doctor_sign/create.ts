import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.DoctorSignGetPayload<{
    select: {
        content: true;
    }
}>

export default async function doctorSignCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.doctorSign.create({
        data: {
            content: body.content,
        },
    });
    return {
        success: true,
        message: "Sukses menambahkan doctor sign",
        data: {
            ...body,
        },
    };
}