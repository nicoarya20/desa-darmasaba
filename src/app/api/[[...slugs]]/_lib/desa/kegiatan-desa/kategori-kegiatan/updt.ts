import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
    nama: string;
}

export default async function kategoriKegiatanUpdate(context: Context) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const result = await prisma.kategoriKegiatan.update({
            where: { id },
            data: {
                nama: body.nama,
            },
        });
        return {
            success: true,
            message: "Berhasil mengupdate kategori kegiatan",
            data: result,
        };
    } catch (error) {
        console.error("Error updating kategori kegiatan:", error);
        throw new Error("Gagal mengupdate kategori kegiatan: " + (error as Error).message);
    }
}