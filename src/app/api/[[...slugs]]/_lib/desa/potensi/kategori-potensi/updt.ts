import prisma from "@/lib/prisma";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";

type FormUpdate = {
    nama: string;
}

export default async function kategoriPotensiUpdate(context: Context) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const result = await prisma.kategoriPotensi.update({
            where: { id },
            data: {
                nama: body.nama,
            },
        });
        return {
            success: true,
            message: "Berhasil mengupdate kategori potensi",
            data: result,
        };
    } catch (error) {
        // Ganti nama ke kategori lain yang sudah ada → 409; error lain di-throw
        const duplicate = toDuplicateResponse(error);
        if (duplicate) {
            context.set.status = 409;
            return duplicate;
        }
        console.error("Error updating kategori potensi:", error);
        throw new Error("Gagal mengupdate kategori potensi: " + (error as Error).message);
    }
}