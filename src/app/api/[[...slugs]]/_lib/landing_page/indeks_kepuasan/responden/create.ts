import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    name: string;
    tanggal: string;
    jenisKelaminId: string;
    ratingId: string;
    kelompokUmurId: string;
}

export default async function respondenCreate(context: Context) {
    const body = (await context.body) as FormCreate;

    try {
        // Convert the date string to a Date object
        const tanggal = new Date(body.tanggal);
        
        // Validate the date
        if (isNaN(tanggal.getTime())) {
            throw new Error('Tanggal tidak valid');
        }

        const result = await prisma.responden.create({
            data: {
                name: body.name,
                tanggal: tanggal, // Use the Date object
                jenisKelaminId: body.jenisKelaminId,
                ratingId: body.ratingId,
                kelompokUmurId: body.kelompokUmurId,
            },
        });
        return {
            success: true,
            message: "Berhasil membuat responden",
            data: result,
        };
    } catch (error) {
        console.error("Error creating responden:", error);
        throw new Error("Gagal membuat responden: " + (error as Error).message);
    }
}
    