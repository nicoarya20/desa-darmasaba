import prisma from "@/lib/prisma";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";

type FormUpdate = {
    name: string;
}

export default async function umurRespondenUpdate(context: Context) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const result = await prisma.umurResponden.update({
            where: { id },
            data: {
                name: body.name,
            },
        });
        return {
            success: true,
            message: "Berhasil mengupdate umur responden",
            data: result,
        };
    } catch (error) {
        // Ganti nama ke nilai lain yang sudah ada → 409 "Nama sudah dipakai"
        const duplicate = toDuplicateResponse(error);
        if (duplicate) {
            context.set.status = 409;
            return duplicate;
        }
        console.error("Error updating umur responden:", error);
        throw new Error("Gagal mengupdate umur responden: " + (error as Error).message);
    }
}