import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    name: string;
    value: number;
}

export default async function pembiayaanCreate(context: Context) {
    const body = context.body as FormCreate;

    const created = await prisma.pembiayaan.create({
        data: {
            name: body.name,
            value: body.value,
        },
        select: {
            id: true,
            name: true,
            value: true,
        }
    });
    return {
        success: true,
        message: "Success create pembiayaan",
        data: created,
    };
}