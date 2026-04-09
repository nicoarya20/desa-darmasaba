import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

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
        message: "Sukses menambahkan first aid",
        data: {
            ...body,
        },
    };
}