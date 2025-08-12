import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    name: string;
}

export default async function umurRespondenCreate(context: Context) {
    const body = (await context.body) as FormCreate;

    try {
        const result = await prisma.umurResponden.create({
            data: {
                name: body.name,
            },
        });
        return {
            success: true,
            message: "Berhasil membuat umur responden",
            data: result,
        };
    } catch (error) {
        console.error("Error creating umur responden:", error);
        throw new Error("Gagal membuat umur responden: " + (error as Error).message);
    }
}