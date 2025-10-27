/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function dataLingkunganDesaFindUnique(context: Context) {
    const { id } = context.params as { id: string };

    if (!id) {
        return {
            success: false,
            message: "ID data lingkungan desa diperlukan",
        };
    }

    try {
        const dataLingkunganDesa = await prisma.dataLingkunganDesa.findUnique({
            where: { id },
        });

        if (!dataLingkunganDesa) {
            return {
                success: false,
                message: "Data lingkungan desa tidak ditemukan",
            };
        }

        return {
            success: true,
            data: dataLingkunganDesa,
        };
    } catch (error: any) {
        console.error("Error findUnique data lingkungan desa:", error);
        return {
            success: false,
            message: "Gagal mengambil data data lingkungan desa",
            error: error.message,
        };
    }
}