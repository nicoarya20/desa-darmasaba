import prisma from "@/lib/prisma";
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
        console.error("Error updating kategori potensi:", error);
        throw new Error("Gagal mengupdate kategori potensi: " + (error as Error).message);
    }
}