import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormUpdate = {
    name: string;
}

export default async function roleUpdate(context: Context) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const result = await prisma.role.update({
            where: { id },
            data: {
                name: body.name,
            },
        });
        return {
            success: true,
            message: "Berhasil mengupdate role",
            data: result,
        };
    } catch (error) {
        console.error("Error updating role:", error);
        throw new Error("Gagal mengupdate role: " + (error as Error).message);
    }
}