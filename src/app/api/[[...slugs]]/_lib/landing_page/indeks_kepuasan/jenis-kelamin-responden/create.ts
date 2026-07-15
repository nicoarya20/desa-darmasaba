import prisma from "@/lib/prisma";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";

type FormCreate = {
    name: string;
}

export default async function jenisKelaminRespondenCreate(context: Context) {
    const body = (await context.body) as FormCreate;

    try {
        const result = await prisma.jenisKelaminResponden.create({
            data: {
                name: body.name,
            },
        });
        return {
            success: true,
            message: "Berhasil membuat jenis kelamin responden",
            data: result,
        };
    } catch (error) {
        // Nama unik (@unique) → 409 "Nama sudah dipakai"; error lain di-throw
        const duplicate = toDuplicateResponse(error);
        if (duplicate) {
            context.set.status = 409;
            return duplicate;
        }
        console.error("Error creating jenis kelamin responden:", error);
        throw new Error("Gagal membuat jenis kelamin responden: " + (error as Error).message);
    }
}