import prisma from "@/lib/prisma";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";

type FormUpdate = {
    name: string;
}

export default async function pilihanRatingRespondenUpdate(context: Context) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const result = await prisma.pilihanRatingResponden.update({
            where: { id },
            data: {
                name: body.name,
            },
        });
        return {
            success: true,
            message: "Berhasil mengupdate pilihan rating responden",
            data: result,
        };
    } catch (error) {
        // Ganti nama ke nilai lain yang sudah ada → 409 "Nama sudah dipakai"
        const duplicate = toDuplicateResponse(error);
        if (duplicate) {
            context.set.status = 409;
            return duplicate;
        }
        console.error("Error updating pilihan rating responden:", error);
        throw new Error("Gagal mengupdate pilihan rating responden: " + (error as Error).message);
    }
}