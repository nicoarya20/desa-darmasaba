import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    nama: string;
}

export default async function kategoriKegiatanCreate(context: Context) {
    const body = (await context.body) as FormCreate;

    try {
        const result = await prisma.kategoriKegiatan.create({
            data: {
                nama: body.nama,
            },
        });
        return {
            success: true,
            message: "Berhasil membuat kategori kegiatan",
            data: result,
        };
    } catch (error) {
        console.error("Error creating kategori kegiatan:", error);
        throw new Error("Gagal membuat kategori kegiatan: " + (error as Error).message);
    }
}