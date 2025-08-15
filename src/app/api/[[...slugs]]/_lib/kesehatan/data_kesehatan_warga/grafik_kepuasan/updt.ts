import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
    nama: string;
    tanggal: string;
    jenisKelamin: string;
    alamat: string;
    penyakit: string;
}

export default async function grafikKepuasanUpdate(context: Context) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const result = await prisma.grafikKepuasan.update({
            where: { id },
            data: {
                nama: body.nama,
                tanggal: new Date(body.tanggal),
                jenisKelamin: body.jenisKelamin,
                alamat: body.alamat,
                penyakit: body.penyakit,
            },
        });
        return {
            success: true,
            message: "Berhasil mengupdate data grafik kepuasan",
            data: result,
        };
    } catch (error) {
        console.error("Error updating data grafik kepuasan:", error);
        throw new Error("Gagal mengupdate data grafik kepuasan: " + (error as Error).message);
    }
}