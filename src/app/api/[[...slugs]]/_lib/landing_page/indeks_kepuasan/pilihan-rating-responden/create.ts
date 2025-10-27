import prisma from "@/lib/prisma";
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
        console.error("Error creating pilihan rating responden:", error);
        throw new Error("Gagal membuat pilihan rating responden: " + (error as Error).message);
    }
}