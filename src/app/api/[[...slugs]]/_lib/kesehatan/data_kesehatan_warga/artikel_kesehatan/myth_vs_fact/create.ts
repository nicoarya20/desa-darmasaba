import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { Prisma } from "@prisma/client";

type FormCreate = Prisma.MythVsFactGetPayload<{
    select: {
        title: true;
        mitos: true;
        fakta: true;
    }
}>

export default async function mythVsFactCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.mythVsFact.create({
        data: {
            title: body.title,
            mitos: body.mitos,
            fakta: body.fakta,
        },
    });
    return {
        success: true,
        message: "Success create myth vs fact",
        data: {
            ...body,
        },
    };
}