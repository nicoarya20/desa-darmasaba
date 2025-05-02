import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.SymptomGetPayload<{
    select: {
        title: true;
        content: true;
    }
}>
export default async function symptomCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.symptom.create({
        data: {
            title: body.title,
            content: body.content,
        },
    });
    return {
        success: true,
        message: "Success create symptom",
        data: {
            ...body,
        },
    };
}