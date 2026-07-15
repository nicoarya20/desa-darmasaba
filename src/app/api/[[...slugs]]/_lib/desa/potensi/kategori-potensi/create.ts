import prisma from "@/lib/prisma";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";

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
        // Nama kategori unik (@unique) → 409 "Nama sudah dipakai"; error lain di-throw
        const duplicate = toDuplicateResponse(error);
        if (duplicate) {
            context.set.status = 409;
            return duplicate;
        }
        console.error("Error creating kategori potensi:", error);
        throw new Error("Gagal membuat kategori potensi: " + (error as Error).message);
    }
}
    