import prisma from "@/lib/prisma";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";

type FormCreate = {
    name: string;
}

export default async function pilihanRatingRespondenCreate(context: Context) {
    const body = (await context.body) as FormCreate;

    try {
        const result = await prisma.pilihanRatingResponden.create({
            data: {
                name: body.name,
            },
        });
        return {
            success: true,
            message: "Berhasil membuat pilihan rating responden",
            data: result,
        };
    } catch (error) {
        // Nama unik (@unique) → 409 "Nama sudah dipakai"; error lain di-throw
        const duplicate = toDuplicateResponse(error);
        if (duplicate) {
            context.set.status = 409;
            return duplicate;
        }
        console.error("Error creating pilihan rating responden:", error);
        throw new Error("Gagal membuat pilihan rating responden: " + (error as Error).message);
    }
}