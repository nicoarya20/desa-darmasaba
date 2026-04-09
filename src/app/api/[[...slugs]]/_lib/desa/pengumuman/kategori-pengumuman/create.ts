import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
    name: string;
}

export default async function kategoriPengumumanCreate(context: Context) {
    const body = (await context.body) as FormCreate;

    try {
        const result = await prisma.categoryPengumuman.create({
            data: {
                name: body.name,
            },
        });
        return {
            success: true,
            message: "Berhasil membuat kategori pengumuman",
            data: result,
        };
    } catch (error) {
        console.error("Error creating kategori pengumuman:", error);
        throw new Error("Gagal membuat kategori pengumuman: " + (error as Error).message);
    }
}