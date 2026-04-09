import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormUpdate = {
    name: string;
}

export default async function kategoriBeritaUpdate(context: Context) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const result = await prisma.kategoriBerita.update({
            where: { id },
            data: {
                name: body.name,
            },
        });
        return {
            success: true,
            message: "Berhasil mengupdate kategori berita",
            data: result,
        };
    } catch (error) {
        console.error("Error updating kategori berita:", error);
        throw new Error("Gagal mengupdate kategori berita: " + (error as Error).message);
    }
}