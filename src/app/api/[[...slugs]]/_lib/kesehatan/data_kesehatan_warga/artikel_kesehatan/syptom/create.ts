import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

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
        message: "Sukses menambahkan symptom",
        data: {
            ...body,
        },
    };
}