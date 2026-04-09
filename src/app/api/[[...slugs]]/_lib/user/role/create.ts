import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
    name: string;
}

export default async function roleCreate(context: Context) {
    const body = (await context.body) as FormCreate;

    try {
        const result = await prisma.role.create({
            data: {
                name: body.name,
            },
        });
        return {
            success: true,
            message: "Berhasil membuat role",
            data: result,
        };
    } catch (error) {
        console.error("Error creating role:", error);
        throw new Error("Gagal membuat role: " + (error as Error).message);
    }
}