import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    name: string;
}

export default async function kategoriBeritaCreate(context: Context) {
    const body = (await context.body) as FormCreate;

    try {
        const result = await prisma.kategoriBerita.create({
            data: {
                name: body.name,
            },
        });
        return {
            success: true,
            message: "Berhasil membuat kategori berita",
            data: result,
        };
    } catch (error) {
        console.error("Error creating kategori berita:", error);
        throw new Error("Gagal membuat kategori berita: " + (error as Error).message);
    }
}