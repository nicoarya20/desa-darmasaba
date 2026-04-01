import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
    nama: string;
}

export default async function layananPolsekUpdate(context: Context) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const result = await prisma.layananPolsek.update({
            where: { id },
            data: {
                nama: body.nama,
            },
        });
        return {
            success: true,
            message: "Berhasil mengupdate layanan polsek",
            data: result,
        };
    } catch (error) {
        console.error("Error updating layanan polsek:", error);
        throw new Error("Gagal mengupdate layanan polsek: " + (error as Error).message);
    }
}