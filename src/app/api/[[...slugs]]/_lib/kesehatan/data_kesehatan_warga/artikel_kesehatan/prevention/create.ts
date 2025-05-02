import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

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
        message: "Success create prevention",
        data: {
            ...body,
        },
    };
}
