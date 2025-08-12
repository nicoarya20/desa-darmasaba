import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
    name: string;
    tanggal: string;
    jenisKelaminId: string;
    ratingId: string;
    kelompokUmurId: string;
}

export default async function respondenUpdate(context: Context) {
    const body = (await context.body) as FormUpdate;
    const id = context.params.id as string;

    try {
        const result = await prisma.responden.update({
            where: { id },
            data: {
                name: body.name,
                tanggal: body.tanggal,
                jenisKelaminId: body.jenisKelaminId,
                ratingId: body.ratingId,
                kelompokUmurId: body.kelompokUmurId,
            },
        });
        return {
            success: true,
            message: "Berhasil mengupdate responden",
            data: result,
        };
    } catch (error) {
        console.error("Error updating responden:", error);
        throw new Error("Gagal mengupdate responden: " + (error as Error).message);
    }
}
