/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function programPenghijauanFindUnique(context: Context) {
    const { id } = context.params as { id: string };

    if (!id) {
        return {
            success: false,
            message: "ID program penghijauan diperlukan",
        };
    }

    try {
        const programPenghijauan = await prisma.programPenghijauan.findUnique({
            where: { id },
        });

        if (!programPenghijauan) {
            return {
                success: false,
                message: "Program penghijauan tidak ditemukan",
            };
        }

        return {
            success: true,
            data: programPenghijauan,
        };
    } catch (error: any) {
        console.error("Error findUnique program penghijauan:", error);
        return {
            success: false,
            message: "Gagal mengambil data program penghijauan",
            error: error.message,
        };
    }
}