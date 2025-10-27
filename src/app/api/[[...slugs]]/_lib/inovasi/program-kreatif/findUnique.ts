/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function programKreatifFindUnique(context: Context) {
    const { id } = context.params as { id: string };

    if (!id) {
        return {
            success: false,
            message: "ID program kreatif diperlukan",
        };
    }

    try {
        const programKreatif = await prisma.programKreatif.findUnique({
            where: { id },
        });

        if (!programKreatif) {
            return {
                success: false,
                message: "Program kreatif tidak ditemukan",
            };
        }

        return {
            success: true,
            data: programKreatif,
        };
    } catch (error: any) {
        console.error("Error findUnique program kreatif:", error);
        return {
            success: false,
            message: "Gagal mengambil data program kreatif",
            error: error.message,
        };
    }
}