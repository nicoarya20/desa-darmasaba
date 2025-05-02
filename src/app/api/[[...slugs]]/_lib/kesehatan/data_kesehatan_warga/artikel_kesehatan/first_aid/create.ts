import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.FirstAidGetPayload<{
    select: {
        title: true;
        content: true;
    }
}>
export default async function firstAidCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.firstAid.create({
        data: {
            title: body.title,
            content: body.content,
        },
    });
    return {
        success: true,
        message: "Success create first aid",
        data: {
            ...body,
        },
    };
}