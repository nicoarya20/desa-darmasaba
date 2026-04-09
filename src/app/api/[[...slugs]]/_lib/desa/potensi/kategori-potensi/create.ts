import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
    nama: string;
}

export default async function kategoriPotensiCreate(context: Context) {
    const body = (await context.body) as FormCreate;

    try {
        const result = await prisma.kategoriPotensi.create({
            data: {
                nama: body.nama
            },
        });
        return {
            success: true,
            message: "Berhasil membuat kategori potensi",
            data: result,
        };
    } catch (error) {
        console.error("Error creating kategori potensi:", error);
        throw new Error("Gagal membuat kategori potensi: " + (error as Error).message);
    }
}
    