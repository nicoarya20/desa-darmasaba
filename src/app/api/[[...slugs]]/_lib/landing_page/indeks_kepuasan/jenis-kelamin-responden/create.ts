import prisma from "@/lib/prisma";
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
        console.error("Error creating jenis kelamin responden:", error);
        throw new Error("Gagal membuat jenis kelamin responden: " + (error as Error).message);
    }
}