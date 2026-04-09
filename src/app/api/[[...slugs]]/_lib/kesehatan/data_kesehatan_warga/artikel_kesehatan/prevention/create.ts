import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.PreventionGetPayload<{
    select: {
        title: true;
        content: true;
    }
}>

export default async function preventionCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.prevention.create({
        data: {
            title: body.title,
            content: body.content,
        },
    });
    return {
        success: true,
        message: "Sukses menambahkan prevention",
        data: {
            ...body,
        },
    };
}
