import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
    nama: string;
    tanggal: string;
    jenisKelamin: string;
    alamat: string;
    penyebab: string;
}

export default async function kematianUpdate(context: Context) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const result = await prisma.kematian.update({
            where: { id },
            data: {
                nama: body.nama,
                tanggal: new Date(body.tanggal),
                jenisKelamin: body.jenisKelamin,
                alamat: body.alamat,
                penyebab: body.penyebab,
            },
        });
        return {
            success: true,
            message: "Berhasil mengupdate data kematian",
            data: result,
        };
    } catch (error) {
        console.error("Error updating data kematian:", error);
        throw new Error("Gagal mengupdate data kematian: " + (error as Error).message);
    }
}