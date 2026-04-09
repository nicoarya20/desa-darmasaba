import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
    name: string;
    value: number;

}

export default async function pendapatanAsliCreate(context: Context) {
    const body = context.body as FormCreate;

    const created = await prisma.pendapatan.create({
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
        message: "Sukses menambahkan pendapatan asli desa",
        data: created,
    };
}