import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
    name: string;
}

export default async function kategoriPengumumanUpdate(context: Context) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const result = await prisma.categoryPengumuman.update({
            where: { id },
            data: {
                name: body.name,
            },
        });
        return {
            success: true,
            message: "Berhasil mengupdate kategori pengumuman",
            data: result,
        };
    } catch (error) {
        console.error("Error updating kategori pengumuman:", error);
        throw new Error("Gagal mengupdate kategori pengumuman: " + (error as Error).message);
    }
}