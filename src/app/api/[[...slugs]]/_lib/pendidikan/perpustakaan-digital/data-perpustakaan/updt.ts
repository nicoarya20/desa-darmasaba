import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeReleasedFiles from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";

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
        const before = await prisma.dataPerpustakaan.findUnique({ where: { id }, select: { imageId: true } });
        const result = await prisma.dataPerpustakaan.update({
            where: { id },
            data: {
                judul: body.judul,
                deskripsi: body.deskripsi,
                imageId: body.imageId,
                kategoriId: body.kategoriId,
            },
        });
        await removeReleasedFiles("DataPerpustakaan", [before?.imageId], [result.imageId]);
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
    