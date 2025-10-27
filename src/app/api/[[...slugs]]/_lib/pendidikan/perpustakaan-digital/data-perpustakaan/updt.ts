import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
    judul: string;
    deskripsi: string;
    imageId: string;
    kategoriId: string;
}

export default async function dataPerpustakaanUpdate(context: Context) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const result = await prisma.dataPerpustakaan.update({
            where: { id },
            data: {
                judul: body.judul,
                deskripsi: body.deskripsi,
                imageId: body.imageId,
                kategoriId: body.kategoriId,
            },
        });
        return {
            success: true,
            message: "Berhasil mengupdate data perpustakaan",
            data: result,
        };
    } catch (error) {
        console.error("Error updating data perpustakaan:", error);
        throw new Error("Gagal mengupdate data perpustakaan: " + (error as Error).message);
    }
}
    