import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormUpdate = {
    nama: string;
    tanggal: string;
    jenisKelamin: string;
    alamat: string;
}

export default async function kelahiranUpdate(context: Context) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const result = await prisma.kelahiran.update({
            where: { id },
            data: {
                nama: body.nama,
                tanggal: new Date(body.tanggal),
                jenisKelamin: body.jenisKelamin,
                alamat: body.alamat,
            },
        });
        return {
            success: true,
            message: "Berhasil mengupdate data kelahiran",
            data: result,
        };
    } catch (error) {
        console.error("Error updating data kelahiran:", error);
        throw new Error("Gagal mengupdate data kelahiran: " + (error as Error).message);
    }
}