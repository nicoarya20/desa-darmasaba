import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
    name: string;
}

export default async function jenisKelaminRespondenUpdate(context: Context) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const result = await prisma.jenisKelaminResponden.update({
            where: { id },
            data: {
                name: body.name,
            },
        });
        return {
            success: true,
            message: "Berhasil mengupdate jenis kelamin responden",
            data: result,
        };
    } catch (error) {
        console.error("Error updating jenis kelamin responden:", error);
        throw new Error("Gagal mengupdate jenis kelamin responden: " + (error as Error).message);
    }
}