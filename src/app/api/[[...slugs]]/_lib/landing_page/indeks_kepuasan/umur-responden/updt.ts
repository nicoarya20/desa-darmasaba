import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormUpdate = {
    name: string;
}

export default async function umurRespondenUpdate(context: Context) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const result = await prisma.umurResponden.update({
            where: { id },
            data: {
                name: body.name,
            },
        });
        return {
            success: true,
            message: "Berhasil mengupdate umur responden",
            data: result,
        };
    } catch (error) {
        console.error("Error updating umur responden:", error);
        throw new Error("Gagal mengupdate umur responden: " + (error as Error).message);
    }
}