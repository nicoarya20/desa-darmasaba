import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
    name: string;
}

export default async function kategoriBukuCreate(context: Context) {
    const body = (await context.body) as FormCreate;

    try {
        const result = await prisma.kategoriBuku.create({
            data: {
                name: body.name,
            },
        });
        return {
            success: true,
            message: "Berhasil membuat kategori buku",
            data: result,
        };
    } catch (error) {
        console.error("Error creating kategori buku:", error);
        throw new Error("Gagal membuat kategori buku: " + (error as Error).message);
    }
}