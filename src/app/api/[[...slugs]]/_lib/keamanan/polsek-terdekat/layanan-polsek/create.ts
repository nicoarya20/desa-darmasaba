import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
    nama: string;
}

export default async function layananPolsekCreate(context: Context) {
    const body = (await context.body) as FormCreate;

    try {
        const result = await prisma.layananPolsek.create({
            data: {
                nama: body.nama,
            },
        });
        return {
            success: true,
            message: "Berhasil membuat kategori layanan polsek",
            data: result,
        };
    } catch (error) {
        console.error("Error creating kategori layanan polsek:", error);
        throw new Error("Gagal membuat kategori layanan polsek: " + (error as Error).message);
    }
}